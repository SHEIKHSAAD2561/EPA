import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

import { getCategory } from '../data/categories';
import { Item, Settings } from '../models/item.model';
import { parseDateStr } from '../utils/dates';

/** Max reminders per item; notification id = nid * SLOT + index */
const SLOT = 10;

/**
 * Schedules on-device reminders with Capacitor Local Notifications.
 * Works on Android and iOS. In the browser it does nothing, so the app
 * can still be developed with `npm start`.
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  readonly isNative = Capacitor.isNativePlatform();

  async permissionState(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
    if (!this.isNative) return 'unavailable';
    const p = await LocalNotifications.checkPermissions();
    return p.display === 'granted' ? 'granted' : p.display === 'denied' ? 'denied' : 'prompt';
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isNative) return false;
    const p = await LocalNotifications.requestPermissions();
    return p.display === 'granted';
  }

  /** Replace all scheduled reminders for one item. */
  async schedule(item: Item, settings: Settings): Promise<void> {
    if (!this.isNative) return;
    await this.cancel(item);
    if (item.status !== 'active' || !settings.notificationsEnabled) return;
    if ((await this.permissionState()) !== 'granted' && !(await this.requestPermission())) return;

    const notifications = this.build(item, settings);
    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  }

  async cancel(item: Item): Promise<void> {
    if (!this.isNative) return;
    const ids = Array.from({ length: SLOT }, (_, i) => ({ id: item.nid * SLOT + i }));
    await LocalNotifications.cancel({ notifications: ids });
  }

  /** Clear everything and schedule again (after settings change or import). */
  async rescheduleAll(items: Item[], settings: Settings): Promise<void> {
    if (!this.isNative) return;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
    if (!settings.notificationsEnabled) return;
    const all = items.filter((i) => i.status === 'active').flatMap((i) => this.build(i, settings));
    if (all.length) await LocalNotifications.schedule({ notifications: all });
  }

  async sendTest(): Promise<void> {
    if (!this.isNative) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999_999,
          title: 'EPA reminders are working ✅',
          body: "You'll get alerts like this before your items expire.",
          schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true },
        },
      ],
    });
  }

  private build(item: Item, settings: Settings): LocalNotificationSchema[] {
    const category = getCategory(item.categoryId);
    const now = Date.now();
    const days = [...new Set(item.reminderDays)].sort((a, b) => b - a).slice(0, SLOT);

    return days
      .map((d, i) => {
        const at = parseDateStr(item.expiryDate);
        at.setDate(at.getDate() - d);
        at.setHours(settings.reminderHour, 0, 0, 0);
        return { d, i, at };
      })
      .filter(({ at }) => at.getTime() > now)
      .map(({ d, i, at }) => ({
        id: item.nid * SLOT + i,
        title: `${item.emoji} ${item.name}`,
        body: this.message(item.name, d, category.lifecycle),
        schedule: { at, allowWhileIdle: true },
        extra: { itemId: item.id },
      }));
  }

  private message(name: string, d: number, lifecycle: 'consume' | 'renew'): string {
    const when = d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`;
    return lifecycle === 'consume'
      ? `${name} expires ${when}. Use it before it goes to waste.`
      : `${name} expires ${when}. Time to renew it.`;
  }
}

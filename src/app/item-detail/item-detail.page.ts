import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  NavController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';
import { map } from 'rxjs';

import { describeReminders, getCategory, getLocation, tintFor } from '../data/categories';
import { ItemStatus } from '../models/item.model';
import { ItemStore } from '../services/item.store';
import { addDays, expiryLabel, formatDate, formatHijri, todayStr, urgency } from '../utils/dates';

const STATUS_TEXT: Record<ItemStatus, string> = {
  active: 'Active',
  used: 'Used up',
  discarded: 'Thrown away',
  renewed: 'Renewed',
  cancelled: 'Cancelled',
};

@Component({
  selector: 'app-item-detail',
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, IonContent, RouterLink],
  templateUrl: './item-detail.page.html',
  styleUrl: './item-detail.page.scss',
})
export class ItemDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly nav = inject(NavController);
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);
  protected readonly store = inject(ItemStore);

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id')!)), { initialValue: '' });

  protected readonly item = computed(() => {
    this.store.items();
    return this.store.get(this.id());
  });
  protected readonly category = computed(() => (this.item() ? getCategory(this.item()!.categoryId) : null));
  protected readonly tint = computed(() => (this.item() ? tintFor(this.item()!) : ''));
  protected readonly location = computed(() => getLocation(this.item()?.location));
  protected readonly level = computed(() => (this.item() ? urgency(this.item()!.expiryDate) : 'ok'));
  protected readonly label = computed(() => (this.item() ? expiryLabel(this.item()!.expiryDate) : ''));
  protected readonly date = computed(() => (this.item() ? formatDate(this.item()!.expiryDate) : ''));
  protected readonly hijri = computed(() => (this.item() ? formatHijri(this.item()!.expiryDate) : ''));
  protected readonly isActive = computed(() => this.item()?.status === 'active');
  protected readonly statusText = computed(() => (this.item() ? STATUS_TEXT[this.item()!.status] : ''));

  protected readonly reminderText = computed(() => {
    const item = this.item();
    if (!item?.reminderDays.length) return 'No reminders';
    const hour = this.store.settings().reminderHour;
    const time = new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${describeReminders(item.reminderDays)} · ${time}`;
  });

  protected readonly addedOn = computed(() => (this.item() ? formatDate(this.item()!.createdAt.slice(0, 10)) : ''));

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  protected async changeQuantity(delta: number): Promise<void> {
    const item = this.item();
    if (!item) return;
    const quantity = Math.max(0, item.quantity + delta);
    await this.store.update(item.id, { quantity });
    if (quantity === 0) {
      await this.finish('used', 'All used up 👍');
    }
  }

  protected async finish(status: Exclude<ItemStatus, 'active'>, message: string): Promise<void> {
    const item = this.item();
    if (!item) return;
    await this.store.close(item.id, status);
    await this.toast(message, 'Undo', () => this.store.restore(item.id));
    this.nav.back();
  }

  protected async renew(): Promise<void> {
    const item = this.item();
    if (!item) return;
    // Suggest the same period again (e.g. 1 year after the old expiry)
    const base = item.expiryDate > todayStr() ? item.expiryDate : todayStr();
    const period = item.categoryId === 'subscription' ? 30 : 365;
    const suggested = addDays(base, period);
    const alert = await this.alerts.create({
      header: `Renew ${item.name}`,
      message: 'Pick the new expiry date. Reminders will be rescheduled.',
      inputs: [{ name: 'date', type: 'date', value: suggested, min: todayStr() }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Renew',
          handler: (v: { date: string }) => {
            if (!v.date) return false;
            this.store.renew(item.id, v.date).then(() => this.toast('Renewed ✅ New reminders set.'));
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  protected async restore(): Promise<void> {
    const item = this.item();
    if (!item) return;
    await this.store.restore(item.id);
    await this.toast('Back on your list');
  }

  protected async remove(): Promise<void> {
    const item = this.item();
    if (!item) return;
    const alert = await this.alerts.create({
      header: 'Delete item?',
      message: `${item.name} and its reminders will be removed permanently.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.store.remove(item.id).then(() => this.nav.navigateBack('/tabs/home'));
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string, actionText?: string, action?: () => void): Promise<void> {
    const t = await this.toasts.create({
      message,
      duration: 3000,
      position: 'bottom',
      buttons: actionText ? [{ text: actionText, handler: action }] : [],
    });
    await t.present();
  }
}

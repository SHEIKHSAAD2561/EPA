import { computed, inject, Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { DEFAULT_SETTINGS, CategoryId, Item, ItemStatus, NewItem, Settings } from '../models/item.model';
import { addDays, daysLeft, todayStr } from '../utils/dates';
import { ReminderService } from './reminder.service';

const ITEMS_KEY = 'epa.items.v1';
const SETTINGS_KEY = 'epa.settings.v1';

/**
 * Single source of truth for items and settings.
 * Data is saved on the device with Capacitor Preferences
 * (localStorage in the browser, native storage on the phone).
 */
@Injectable({ providedIn: 'root' })
export class ItemStore {
  private readonly reminders = inject(ReminderService);

  private readonly _items = signal<Item[]>([]);
  private readonly _settings = signal<Settings>(DEFAULT_SETTINGS);
  readonly loaded = signal(false);

  readonly items = this._items.asReadonly();
  readonly settings = this._settings.asReadonly();

  /** Items still being tracked, soonest expiry first. */
  readonly active = computed(() =>
    this._items()
      .filter((i) => i.status === 'active')
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)),
  );

  readonly done = computed(() =>
    this._items()
      .filter((i) => i.status !== 'active')
      .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? '')),
  );

  readonly expired = computed(() => this.active().filter((i) => daysLeft(i.expiryDate) < 0));
  /** Not expired, but within 7 days */
  readonly expiringSoon = computed(() =>
    this.active().filter((i) => {
      const d = daysLeft(i.expiryDate);
      return d >= 0 && d <= 7;
    }),
  );
  /** Expired + expiring within 3 days */
  readonly needsAttention = computed(() => this.active().filter((i) => daysLeft(i.expiryDate) <= 3));

  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  // ---------- queries ----------

  get(id: string): Item | undefined {
    return this._items().find((i) => i.id === id);
  }

  byCategory(categoryId: CategoryId): Item[] {
    return this.active().filter((i) => i.categoryId === categoryId);
  }

  countByCategory(categoryId: CategoryId): { total: number; soon: number } {
    const items = this.byCategory(categoryId);
    return { total: items.length, soon: items.filter((i) => daysLeft(i.expiryDate) <= 7).length };
  }

  // ---------- commands ----------

  async add(data: NewItem): Promise<Item> {
    const now = new Date().toISOString();
    const item: Item = {
      ...data,
      id: crypto.randomUUID(),
      nid: this.nextNid(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this._items.update((list) => [...list, item]);
    await this.persist();
    await this.reminders.schedule(item, this._settings());
    return item;
  }

  async update(id: string, patch: Partial<NewItem>): Promise<void> {
    const item = this.patch(id, { ...patch });
    await this.persist();
    if (item) await this.reminders.schedule(item, this._settings());
  }

  /** Used it, threw it away, or cancelled it. */
  async close(id: string, status: Exclude<ItemStatus, 'active'>): Promise<void> {
    const item = this.patch(id, { status, closedAt: new Date().toISOString() });
    await this.persist();
    if (item) await this.reminders.cancel(item);
  }

  /** Renewed: the item continues with a new expiry date. */
  async renew(id: string, newExpiry: string): Promise<void> {
    const item = this.patch(id, { expiryDate: newExpiry, status: 'active', closedAt: undefined });
    await this.persist();
    if (item) await this.reminders.schedule(item, this._settings());
  }

  /** Put a finished item back on the active list. */
  async restore(id: string): Promise<void> {
    await this.renew(id, this.get(id)?.expiryDate ?? todayStr());
  }

  async remove(id: string): Promise<void> {
    const item = this.get(id);
    this._items.update((list) => list.filter((i) => i.id !== id));
    await this.persist();
    if (item) await this.reminders.cancel(item);
  }

  async updateSettings(patch: Partial<Settings>): Promise<void> {
    this._settings.update((s) => ({ ...s, ...patch }));
    await Preferences.set({ key: SETTINGS_KEY, value: JSON.stringify(this._settings()) });
    await this.reminders.rescheduleAll(this._items(), this._settings());
  }

  async clearAll(): Promise<void> {
    this._items.set([]);
    await this.persist();
    await this.reminders.rescheduleAll([], this._settings());
  }

  /** Example data so the screens are not empty while developing. */
  async loadDemoData(): Promise<void> {
    const t = todayStr();
    const demo: NewItem[] = [
      { name: 'Cheddar Cheese', emoji: '🧀', categoryId: 'food', location: 'fridge', quantity: 1, unit: 'pack', expiryDate: addDays(t, 3), reminderDays: [2, 0] },
      { name: 'Zucchini', emoji: '🥒', categoryId: 'food', location: 'fridge', quantity: 4, unit: 'pcs', expiryDate: addDays(t, 3), reminderDays: [2, 0] },
      { name: 'Croissant', emoji: '🥐', categoryId: 'food', location: 'pantry', quantity: 6, unit: 'pcs', expiryDate: addDays(t, 5), reminderDays: [2, 0] },
      { name: 'Eggs', emoji: '🥚', categoryId: 'food', location: 'fridge', quantity: 12, unit: 'pcs', expiryDate: addDays(t, 6), reminderDays: [2, 0] },
      { name: 'Avocado', emoji: '🥑', categoryId: 'food', location: 'pantry', quantity: 3, unit: 'pcs', expiryDate: addDays(t, 2), reminderDays: [1, 0] },
      { name: 'Fresh Milk', emoji: '🥛', categoryId: 'food', location: 'fridge', quantity: 2, unit: 'L', expiryDate: addDays(t, 1), reminderDays: [1, 0] },
      { name: 'Laban', emoji: '🥛', categoryId: 'food', location: 'fridge', quantity: 1, unit: 'L', expiryDate: addDays(t, -1), reminderDays: [1, 0] },
      { name: 'Banana', emoji: '🍌', categoryId: 'food', location: 'pantry', quantity: 4, unit: 'pcs', expiryDate: addDays(t, 4), reminderDays: [1] },
      { name: 'Ice Cream', emoji: '🍦', categoryId: 'food', location: 'freezer', quantity: 5, unit: 'pcs', expiryDate: addDays(t, 60), reminderDays: [7] },
      { name: 'Chicken Breast', emoji: '🍗', categoryId: 'food', location: 'freezer', quantity: 2, unit: 'kg', expiryDate: addDays(t, 45), reminderDays: [7, 1] },
      { name: 'Pasta', emoji: '🍝', categoryId: 'food', location: 'pantry', quantity: 3, unit: 'pack', expiryDate: addDays(t, 200), reminderDays: [14] },
      { name: 'Dates', emoji: '🌴', categoryId: 'food', location: 'pantry', quantity: 1, unit: 'kg', expiryDate: addDays(t, 90), reminderDays: [7] },
      { name: 'Panadol', emoji: '💊', categoryId: 'medicine', quantity: 24, unit: 'tablets', expiryDate: addDays(t, 40), reminderDays: [30, 7] },
      { name: 'Cough Syrup', emoji: '🧴', categoryId: 'medicine', quantity: 1, unit: 'bottle', expiryDate: addDays(t, 9), reminderDays: [7, 1] },
      { name: 'Iqama', emoji: '🪪', categoryId: 'documents', quantity: 1, expiryDate: addDays(t, 25), reminderDays: [30, 7, 1], notes: 'Renew through Absher' },
      { name: 'Passport', emoji: '🛂', categoryId: 'documents', quantity: 1, expiryDate: addDays(t, 540), reminderDays: [180, 30] },
      { name: 'Driving Licence', emoji: '🪪', categoryId: 'documents', quantity: 1, expiryDate: addDays(t, 320), reminderDays: [30, 7, 1] },
      { name: 'Car Insurance', emoji: '🛡️', categoryId: 'vehicle', quantity: 1, expiryDate: addDays(t, 20), reminderDays: [30, 7, 1] },
      { name: 'Istimara', emoji: '📋', categoryId: 'vehicle', quantity: 1, expiryDate: addDays(t, 150), reminderDays: [30, 7] },
      { name: 'Fahas Inspection', emoji: '🔧', categoryId: 'vehicle', quantity: 1, expiryDate: addDays(t, 75), reminderDays: [14, 3] },
      { name: 'Laptop Warranty', emoji: '💻', categoryId: 'warranty', quantity: 1, expiryDate: addDays(t, 210), reminderDays: [30, 7] },
      { name: 'Washing Machine', emoji: '🧺', categoryId: 'warranty', quantity: 1, expiryDate: addDays(t, 400), reminderDays: [30] },
      { name: 'Netflix', emoji: '🎬', categoryId: 'subscription', quantity: 1, expiryDate: addDays(t, 6), reminderDays: [3, 1] },
      { name: 'Gym Membership', emoji: '🏋️', categoryId: 'subscription', quantity: 1, expiryDate: addDays(t, 33), reminderDays: [7, 1] },
    ];
    const now = new Date().toISOString();
    let nid = this.nextNid();
    const created: Item[] = demo.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      nid: nid++,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }));
    this._items.update((list) => [...list, ...created]);
    await this.persist();
    if (await this.reminders.requestPermission()) {
      await this.reminders.rescheduleAll(this._items(), this._settings());
    }
  }

  // ---------- internals ----------

  private patch(id: string, patch: Partial<Item>): Item | undefined {
    let updated: Item | undefined;
    this._items.update((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        updated = { ...i, ...patch, updatedAt: new Date().toISOString() };
        return updated;
      }),
    );
    return updated;
  }

  private nextNid(): number {
    return this._items().reduce((max, i) => Math.max(max, i.nid), 0) + 1;
  }

  private async load(): Promise<void> {
    try {
      const [items, settings] = await Promise.all([
        Preferences.get({ key: ITEMS_KEY }),
        Preferences.get({ key: SETTINGS_KEY }),
      ]);
      if (items.value) this._items.set(JSON.parse(items.value));
      if (settings.value) this._settings.set({ ...DEFAULT_SETTINGS, ...JSON.parse(settings.value) });
    } catch (e) {
      console.error('Could not load saved data', e);
    } finally {
      this.loaded.set(true);
    }
  }

  private persist(): Promise<void> {
    return Preferences.set({ key: ITEMS_KEY, value: JSON.stringify(this._items()) });
  }
}

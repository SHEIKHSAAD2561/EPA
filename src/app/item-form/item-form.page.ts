import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonInput,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController,
  ToastController,
} from '@ionic/angular';

import { CATEGORIES, getCategory, LOCATIONS, REMINDER_OPTIONS, UNITS } from '../data/categories';
import { CategoryId, LocationId } from '../models/item.model';
import { ItemStore } from '../services/item.store';
import { addDays, expiryLabel, formatHijri, todayStr } from '../utils/dates';

@Component({
  selector: 'app-item-form',
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonFooter,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
  ],
  templateUrl: './item-form.page.html',
  styleUrl: './item-form.page.scss',
})
export class ItemFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly nav = inject(NavController);
  private readonly toasts = inject(ToastController);
  private readonly store = inject(ItemStore);

  protected readonly categories = CATEGORIES;
  protected readonly locations = LOCATIONS;
  protected readonly reminderOptions = REMINDER_OPTIONS;
  protected readonly units = UNITS;
  protected readonly today = todayStr();
  protected readonly maxDate = addDays(todayStr(), 365 * 20);

  /** Set when editing an existing item */
  protected editId: string | null = null;

  // Form state
  protected readonly categoryId = signal<CategoryId>('food');
  protected readonly name = signal('');
  protected readonly emoji = signal('🥛');
  protected readonly location = signal<LocationId | undefined>('fridge');
  protected readonly quantity = signal(1);
  protected readonly unit = signal('pcs');
  protected readonly expiryDate = signal(addDays(todayStr(), 7));
  protected readonly reminderDays = signal<number[]>([2, 0]);
  protected readonly notes = signal('');
  protected readonly saving = signal(false);
  /** Becomes true once the user picks an emoji or reminders manually */
  private emojiTouched = false;
  private remindersTouched = false;

  protected readonly category = computed(() => getCategory(this.categoryId()));
  protected readonly isFood = computed(() => this.categoryId() === 'food');
  protected readonly preview = computed(() => expiryLabel(this.expiryDate()));
  protected readonly hijri = computed(() => formatHijri(this.expiryDate()));
  protected readonly valid = computed(() => this.name().trim().length > 0 && !!this.expiryDate());

  async ngOnInit(): Promise<void> {
    await this.store.ready;
    this.editId = this.route.snapshot.paramMap.get('id');

    if (this.editId) {
      const item = this.store.get(this.editId);
      if (!item) return;
      this.categoryId.set(item.categoryId);
      this.name.set(item.name);
      this.emoji.set(item.emoji);
      this.location.set(item.location);
      this.quantity.set(item.quantity);
      this.unit.set(item.unit ?? 'pcs');
      this.expiryDate.set(item.expiryDate);
      this.reminderDays.set([...item.reminderDays]);
      this.notes.set(item.notes ?? '');
      this.emojiTouched = this.remindersTouched = true;
      return;
    }

    // New item: pre-fill from query params (?category=food&location=fridge)
    const q = this.route.snapshot.queryParamMap;
    const cat = q.get('category') as CategoryId | null;
    if (cat && CATEGORIES.some((c) => c.id === cat)) this.selectCategory(cat);
    const loc = q.get('location') as LocationId | null;
    if (loc) this.location.set(loc);
  }

  protected selectCategory(id: CategoryId): void {
    this.categoryId.set(id);
    const c = getCategory(id);
    if (!this.emojiTouched) this.emoji.set(c.emojiSuggestions[0]);
    if (!this.remindersTouched) this.reminderDays.set([...c.defaultReminderDays]);
    this.location.set(id === 'food' ? (this.location() ?? 'fridge') : undefined);
    if (!c.hasQuantity) this.quantity.set(1);
    if (!this.editId) this.expiryDate.set(addDays(todayStr(), c.quickDates[1].days));
  }

  protected pickEmoji(e: string): void {
    this.emoji.set(e);
    this.emojiTouched = true;
  }

  protected pickName(n: string): void {
    this.name.set(n);
  }

  protected quickDate(days: number): void {
    this.expiryDate.set(addDays(todayStr(), days));
  }

  protected onDate(value: string | string[] | null | undefined): void {
    if (typeof value === 'string') this.expiryDate.set(value.slice(0, 10));
  }

  protected toggleReminder(days: number): void {
    this.remindersTouched = true;
    this.reminderDays.update((list) => (list.includes(days) ? list.filter((d) => d !== days) : [...list, days]));
  }

  protected step(delta: number): void {
    this.quantity.update((q) => Math.max(1, q + delta));
  }

  protected async save(): Promise<void> {
    if (!this.valid() || this.saving()) return;
    this.saving.set(true);
    const data = {
      name: this.name().trim(),
      emoji: this.emoji() || this.category().emoji,
      categoryId: this.categoryId(),
      location: this.isFood() ? this.location() : undefined,
      quantity: this.category().hasQuantity ? this.quantity() : 1,
      unit: this.category().hasQuantity ? this.unit() : undefined,
      expiryDate: this.expiryDate(),
      reminderDays: [...this.reminderDays()].sort((a, b) => b - a),
      notes: this.notes().trim() || undefined,
    };

    try {
      if (this.editId) {
        await this.store.update(this.editId, data);
        await this.toast('Saved ✅');
        this.nav.back();
      } else {
        const item = await this.store.add(data);
        await this.toast(`${item.emoji} ${item.name} added. We'll remind you.`);
        this.nav.navigateBack('/tabs/home');
      }
    } finally {
      this.saving.set(false);
    }
  }

  private async toast(message: string): Promise<void> {
    const t = await this.toasts.create({ message, duration: 2200, position: 'bottom' });
    await t.present();
  }
}

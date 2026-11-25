import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSearchbar } from '@ionic/angular';

import { AddPillComponent } from '../components/add-pill.component';
import { ItemRowComponent } from '../components/item-row.component';
import { CATEGORIES } from '../data/categories';
import { CategoryId, Item } from '../models/item.model';
import { ItemStore } from '../services/item.store';
import { daysLeft, parseDateStr } from '../utils/dates';

type Filter = 'expired' | 'week' | 'month' | 'all' | 'done';

@Component({
  selector: 'app-expiring',
  imports: [IonContent, IonSearchbar, ItemRowComponent, AddPillComponent],
  template: `
    <ion-content>
      <div class="page">
        <header class="page-head">
          <div>
            <h1>Expiring</h1>
            <p>{{ store.expired().length }} expired · {{ store.expiringSoon().length }} more within 7 days</p>
          </div>
        </header>

        <ion-searchbar #search class="epa" placeholder="Search all items" [value]="query()" (ionInput)="query.set($any($event).detail.value ?? '')"></ion-searchbar>

        <div class="chip-row scroll filters">
          @for (f of filters; track f.id) {
            <button class="chip" [class.selected]="filter() === f.id" (click)="filter.set(f.id)">
              {{ f.label }} <span class="n">{{ count(f.id) }}</span>
            </button>
          }
        </div>
        <div class="chip-row scroll filters">
          <button class="chip" [class.selected]="!category()" (click)="category.set(null)">All categories</button>
          @for (c of categories; track c.id) {
            <button class="chip" [class.selected]="category() === c.id" (click)="category.set(c.id)">{{ c.emoji }} {{ c.name }}</button>
          }
        </div>

        @if (groups().length) {
          @for (g of groups(); track g.title) {
            <div class="section-head"><h2>{{ g.title }}</h2></div>
            <div class="stack">
              @for (item of g.items; track item.id) {
                <app-item-row [item]="item" />
              }
            </div>
          }
        } @else {
          <div class="empty">
            <div class="big">{{ filter() === 'expired' ? '🎉' : '🔍' }}</div>
            <h3>{{ filter() === 'expired' ? 'Nothing expired' : 'No items found' }}</h3>
            <p>Try another filter or search term.</p>
          </div>
        }
      </div>
      <app-add-pill />
    </ion-content>
  `,
  styles: `
    .filters { margin-top: 10px; }
    .n { opacity: .55; font-size: 12px; }
    .stack { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 820px) { .stack { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class ExpiringPage {
  protected readonly store = inject(ItemStore);
  private readonly route = inject(ActivatedRoute);
  private readonly searchbar = viewChild<IonSearchbar>('search');

  protected readonly categories = CATEGORIES;
  protected readonly filters: { id: Filter; label: string }[] = [
    { id: 'week', label: 'This week' },
    { id: 'expired', label: 'Expired' },
    { id: 'month', label: '30 days' },
    { id: 'all', label: 'All' },
    { id: 'done', label: 'Done' },
  ];

  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('week');
  protected readonly category = signal<CategoryId | null>(null);

  constructor() {
    // Focus the search box when opened from the home search button
    effect(() => {
      const sb = this.searchbar();
      if (sb && this.route.snapshot.queryParamMap.get('search')) {
        this.filter.set('all');
        setTimeout(() => sb.setFocus(), 300);
      }
    });
  }

  protected count(f: Filter): number {
    return this.base(f).length;
  }

  private base(f: Filter): Item[] {
    const active = this.store.active();
    switch (f) {
      case 'expired':
        return active.filter((i) => daysLeft(i.expiryDate) < 0);
      case 'week':
        return active.filter((i) => daysLeft(i.expiryDate) <= 7);
      case 'month':
        return active.filter((i) => daysLeft(i.expiryDate) <= 30);
      case 'done':
        return this.store.done();
      default:
        return active;
    }
  }

  private readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.base(this.filter()).filter(
      (i) => (!cat || i.categoryId === cat) && (!q || i.name.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q)),
    );
  });

  /** Group into Expired / This week / This month / Later, or by month for "Done". */
  protected readonly groups = computed(() => {
    const items = this.filtered();
    if (this.filter() === 'done') {
      return items.length ? [{ title: 'Used, renewed or removed', items }] : [];
    }
    const buckets: Record<string, Item[]> = { Expired: [], Today: [], 'This week': [], 'This month': [] };
    const later = new Map<string, Item[]>();
    for (const i of items) {
      const d = daysLeft(i.expiryDate);
      if (d < 0) buckets['Expired'].push(i);
      else if (d === 0) buckets['Today'].push(i);
      else if (d <= 7) buckets['This week'].push(i);
      else if (d <= 30) buckets['This month'].push(i);
      else {
        const key = parseDateStr(i.expiryDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        later.set(key, [...(later.get(key) ?? []), i]);
      }
    }
    return [
      ...Object.entries(buckets).map(([title, items]) => ({ title, items })),
      ...[...later.entries()].map(([title, items]) => ({ title, items })),
    ].filter((g) => g.items.length);
  });
}

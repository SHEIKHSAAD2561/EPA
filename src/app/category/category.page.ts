import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonSearchbar, IonToolbar } from '@ionic/angular';
import { map } from 'rxjs';

import { AddPillComponent } from '../components/add-pill.component';
import { CategoryCardComponent } from '../components/category-card.component';
import { ItemRowComponent } from '../components/item-row.component';
import { getCategory, LOCATIONS } from '../data/categories';
import { CategoryId, LocationId } from '../models/item.model';
import { ItemStore } from '../services/item.store';
import { daysLeft } from '../utils/dates';

type Sort = 'expiry' | 'name' | 'added';

@Component({
  selector: 'app-category',
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonSearchbar, ItemRowComponent, CategoryCardComponent, AddPillComponent],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/categories" text=""></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page">
        <header class="page-head">
          <div>
            <h1>{{ category().emoji }} {{ category().name }}</h1>
            <p>{{ all().length }} items, {{ nearCount() }} near expiration</p>
          </div>
        </header>

        @if (isFood()) {
          <div class="section-head"><h2>Locations</h2></div>
          <div class="loc-grid">
            @for (loc of locations; track loc.id) {
              <app-category-card
                [title]="loc.name"
                [emoji]="loc.emoji"
                [count]="locationCount(loc.id)"
                [background]="loc.gradient"
                [link]="[]"
                [query]="{ location: location() === loc.id ? '' : loc.id }"
                [active]="location() === loc.id"
              />
            }
          </div>
        }

        <ion-searchbar class="epa" placeholder="Search {{ category().name.toLowerCase() }}" [value]="query()" (ionInput)="query.set($any($event).detail.value ?? '')"></ion-searchbar>

        <div class="chip-row scroll filters">
          @for (s of sorts; track s.id) {
            <button class="chip" [class.selected]="sort() === s.id" (click)="sort.set(s.id)">{{ s.label }}</button>
          }
        </div>

        <div class="section-head">
          <h2>{{ listTitle() }}</h2>
        </div>

        @if (visible().length) {
          <div class="stack">
            @for (item of visible(); track item.id) {
              <app-item-row [item]="item" />
            }
          </div>
        } @else {
          <div class="empty">
            <div class="big">{{ category().emoji }}</div>
            <h3>No items here yet</h3>
            <p>Tap “Add new item” to start tracking.</p>
          </div>
        }
      </div>
      <app-add-pill class="no-tabs" [params]="addParams()" />
    </ion-content>
  `,
  styles: `
    .loc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px; }
    .loc-grid app-category-card { min-height: 170px; }
    .filters { margin: 8px 0 0; }
    .stack { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 820px) { .stack { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class CategoryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ItemStore);

  protected readonly locations = LOCATIONS;
  protected readonly sorts: { id: Sort; label: string }[] = [
    { id: 'expiry', label: 'Expiry date' },
    { id: 'name', label: 'Name A–Z' },
    { id: 'added', label: 'Recently added' },
  ];

  private readonly categoryId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') as CategoryId)), {
    initialValue: 'food' as CategoryId,
  });
  protected readonly location = toSignal(
    this.route.queryParamMap.pipe(map((p) => (p.get('location') || null) as LocationId | null)),
    { initialValue: null },
  );

  protected readonly query = signal('');
  protected readonly sort = signal<Sort>('expiry');

  protected readonly category = computed(() => getCategory(this.categoryId()));
  protected readonly isFood = computed(() => this.categoryId() === 'food');
  protected readonly all = computed(() => {
    this.store.active();
    return this.store.byCategory(this.categoryId());
  });
  protected readonly nearCount = computed(() => this.all().filter((i) => daysLeft(i.expiryDate) <= 7).length);

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const loc = this.location();
    const list = this.all().filter(
      (i) => (!loc || i.location === loc) && (!q || i.name.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q)),
    );
    switch (this.sort()) {
      case 'name':
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case 'added':
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default:
        return list;
    }
  });

  protected readonly listTitle = computed(() => {
    const loc = LOCATIONS.find((l) => l.id === this.location());
    return loc ? `In the ${loc.name.toLowerCase()}` : 'All items';
  });

  protected readonly addParams = computed(() => {
    const p: Record<string, string> = { category: this.categoryId() };
    if (this.location()) p['location'] = this.location()!;
    return p;
  });

  protected locationCount(id: LocationId): number {
    return this.all().filter((i) => i.location === id).length;
  }
}

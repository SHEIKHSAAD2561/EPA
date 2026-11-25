import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, searchOutline } from 'ionicons/icons';

import { AddPillComponent } from '../components/add-pill.component';
import { CategoryCardComponent } from '../components/category-card.component';
import { ItemRowComponent } from '../components/item-row.component';
import { ItemTileComponent } from '../components/item-tile.component';
import { CATEGORIES, LOCATIONS } from '../data/categories';
import { ItemStore } from '../services/item.store';
import { daysLeft } from '../utils/dates';

@Component({
  selector: 'app-home',
  imports: [IonContent, IonIcon, RouterLink, ItemRowComponent, ItemTileComponent, CategoryCardComponent, AddPillComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly store = inject(ItemStore);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES;
  protected readonly locations = LOCATIONS;

  protected readonly greeting = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  });

  protected readonly subtitle = computed(() => {
    const total = this.store.active().length;
    const near = this.store.active().filter((i) => daysLeft(i.expiryDate) <= 7).length;
    return `${total} item${total === 1 ? '' : 's'}, ${near} near expiration`;
  });

  /** Left column: expired or expiring within 3 days (max 4) */
  protected readonly attention = computed(() => this.store.needsAttention().slice(0, 4));

  /** Carousel: everything that expires in the next 30 days */
  protected readonly upcoming = computed(() =>
    this.store.active().filter((i) => {
      const d = daysLeft(i.expiryDate);
      return d >= 0 && d <= 30;
    }),
  );

  protected readonly locationCounts = computed(() => {
    const food = this.store.byCategory('food');
    return Object.fromEntries(LOCATIONS.map((l) => [l.id, food.filter((i) => i.location === l.id).length]));
  });

  protected readonly categoryStats = computed(() => {
    this.store.active();
    return Object.fromEntries(CATEGORIES.map((c) => [c.id, this.store.countByCategory(c.id)]));
  });

  constructor() {
    addIcons({ searchOutline, arrowForward });
  }

  protected gradient(tint: string, accent: string): string {
    return `linear-gradient(160deg, ${tint} 0%, ${accent} 100%)`;
  }

  protected search(): void {
    this.router.navigate(['/tabs/expiring'], { queryParams: { search: 1 } });
  }

  protected demo(): void {
    this.store.loadDemoData();
  }
}

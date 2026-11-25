import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

import { AddPillComponent } from '../components/add-pill.component';
import { CATEGORIES } from '../data/categories';
import { ItemStore } from '../services/item.store';

@Component({
  selector: 'app-categories',
  imports: [IonContent, RouterLink, AddPillComponent],
  template: `
    <ion-content>
      <div class="page">
        <header class="page-head">
          <div>
            <h1>Categories</h1>
            <p>{{ store.active().length }} items across {{ categories.length }} categories</p>
          </div>
        </header>

        <div class="grid">
          @for (cat of categories; track cat.id) {
            <a class="card" [routerLink]="['/category', cat.id]" [style.background]="cat.tint">
              <div class="top">
                <span class="emoji">{{ cat.emoji }}</span>
                @if (stats()[cat.id].soon) {
                  <span class="soon" [style.background]="cat.accent">{{ stats()[cat.id].soon }} soon</span>
                }
              </div>
              <div class="name">{{ cat.name }}</div>
              <div class="desc">{{ cat.description }}</div>
              <div class="count" [style.color]="cat.accent">{{ stats()[cat.id].total }} items</div>
            </a>
          }
        </div>
      </div>
      <app-add-pill />
    </ion-content>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 12px; }
    @media (min-width: 820px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    .card {
      display: flex; flex-direction: column; padding: 18px; min-height: 190px;
      border-radius: var(--epa-radius); text-decoration: none; color: var(--ion-text-color);
      transition: transform .15s;
    }
    .card:active { transform: scale(.97); }
    .top { display: flex; justify-content: space-between; align-items: flex-start; }
    .emoji { font-size: 44px; }
    .soon { color: #fff; font-size: 12px; font-weight: 600; padding: 4px 9px; border-radius: 999px; }
    .name { font-weight: 600; font-size: 18px; margin-top: 12px; }
    .desc { font-size: 13px; color: rgba(0,0,0,.5); margin-top: 2px; flex: 1; }
    .count { font-weight: 600; font-size: 14px; margin-top: 10px; }
  `,
})
export class CategoriesPage {
  protected readonly store = inject(ItemStore);
  protected readonly categories = CATEGORIES;
  protected readonly stats = computed(() => {
    this.store.active();
    return Object.fromEntries(CATEGORIES.map((c) => [c.id, this.store.countByCategory(c.id)]));
  });
}

import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { tintFor } from '../data/categories';
import { Item } from '../models/item.model';
import { expiryLabel, urgency } from '../utils/dates';

/** Big pastel card used in the "Expiring soon" carousel. */
@Component({
  selector: 'app-item-tile',
  imports: [RouterLink],
  template: `
    <a class="tile" [routerLink]="['/item', item().id]">
      <div class="art" [style.background]="tint()">
        <span class="emoji">{{ item().emoji }}</span>
        @if (item().quantity > 1) {
          <span class="qty">×{{ item().quantity }}</span>
        }
      </div>
      <div class="name">{{ item().name }}</div>
      <div class="when" [class]="'u-' + level()">{{ label() }}</div>
    </a>
  `,
  styles: `
    :host { display: block; width: 168px; }
    .tile { display: block; text-decoration: none; color: inherit; }
    .art {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--epa-radius);
      display: grid;
      place-items: center;
      transition: transform .15s;
    }
    .tile:active .art { transform: scale(.97); }
    .emoji { font-size: 76px; filter: drop-shadow(0 8px 10px rgba(0,0,0,.12)); }
    .qty {
      position: absolute; top: 10px; right: 12px;
      font-size: 13px; font-weight: 600; color: rgba(0,0,0,.45);
    }
    .name { margin-top: 10px; font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .when { font-size: 13px; color: var(--epa-muted); margin-top: 2px; }
    .when.u-expired, .when.u-today { color: var(--u); font-weight: 500; }
    @media (min-width: 768px) { :host { width: 200px; } .emoji { font-size: 92px; } }
  `,
})
export class ItemTileComponent {
  readonly item = input.required<Item>();
  protected readonly tint = computed(() => tintFor(this.item()));
  protected readonly label = computed(() => expiryLabel(this.item().expiryDate));
  protected readonly level = computed(() => urgency(this.item().expiryDate));
}

import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { tintFor, getCategory, getLocation } from '../data/categories';
import { Item } from '../models/item.model';
import { expiryLabel, shortLeft, urgency } from '../utils/dates';

/** List row: emoji thumbnail, name, details and a days-left badge. */
@Component({
  selector: 'app-item-row',
  imports: [RouterLink],
  template: `
    <a class="row" [routerLink]="['/item', item().id]">
      <div class="thumb" [style.background]="tint()">{{ item().emoji }}</div>
      <div class="text">
        <div class="name">{{ item().name }}</div>
        <div class="sub">{{ sub() }}</div>
      </div>
      @if (showQuantity() && item().quantity > 0) {
        <div class="count">{{ item().quantity }}</div>
      } @else {
        <div class="badge" [class]="'badge u-' + level()">{{ short() }}</div>
      }
    </a>
  `,
  styles: `
    :host { display: block; }
    .row {
      display: flex; align-items: center; gap: 14px;
      background: var(--epa-card);
      border-radius: var(--epa-radius);
      padding: 14px 18px 14px 14px;
      text-decoration: none; color: inherit;
      transition: transform .15s;
    }
    .row:active { transform: scale(.98); }
    .thumb {
      width: 58px; height: 58px; flex-shrink: 0;
      border-radius: 14px; display: grid; place-items: center;
      font-size: 32px; box-shadow: 0 2px 6px rgba(0,0,0,.04);
    }
    .text { flex: 1; min-width: 0; }
    .name { font-weight: 600; font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sub { font-size: 13px; color: var(--epa-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .count { font-size: 18px; font-weight: 500; color: var(--epa-muted); }
    .badge {
      font-size: 13px; font-weight: 600; padding: 5px 10px; border-radius: 999px;
      background: var(--u-bg); color: var(--u); white-space: nowrap;
    }
  `,
})
export class ItemRowComponent {
  readonly item = input.required<Item>();
  /** Show the quantity on the right instead of the days badge */
  readonly showQuantity = input(false);

  protected readonly tint = computed(() => tintFor(this.item()));
  protected readonly level = computed(() => urgency(this.item().expiryDate));
  protected readonly short = computed(() => shortLeft(this.item().expiryDate));
  protected readonly sub = computed(() => {
    const i = this.item();
    const where = getLocation(i.location)?.name ?? getCategory(i.categoryId).name;
    return `${where} · ${expiryLabel(i.expiryDate)}`;
  });
}

import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { scanOutline } from 'ionicons/icons';

/** Floating "Add new item" button that sits above the tab bar. */
@Component({
  selector: 'app-add-pill',
  imports: [RouterLink, IonIcon],
  template: `
    <a class="pill" routerLink="/item/new" [queryParams]="params()">
      <ion-icon name="scan-outline"></ion-icon>
      <span>Add new item</span>
    </a>
  `,
  styles: `
    :host {
      position: fixed; left: 50%; transform: translateX(-50%);
      bottom: calc(108px + env(safe-area-inset-bottom));
      z-index: 20;
    }
    :host(.no-tabs) { bottom: calc(24px + env(safe-area-inset-bottom)); }
    .pill {
      display: inline-flex; align-items: center; gap: 10px;
      background: #fff; color: var(--ion-text-color);
      padding: 15px 26px; border-radius: 999px;
      font-weight: 600; font-size: 17px; text-decoration: none;
      box-shadow: 0 12px 30px rgba(40,40,30,.16);
      white-space: nowrap;
    }
    .pill:active { transform: scale(.97); }
    ion-icon { font-size: 22px; }
  `,
})
export class AddPillComponent {
  /** Pre-fill the form, e.g. { category: 'food', location: 'fridge' } */
  readonly params = input<Record<string, string>>({});

  constructor() {
    addIcons({ scanOutline });
  }
}

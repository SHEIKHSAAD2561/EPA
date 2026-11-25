import { Component, computed, inject } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alarmOutline, appsOutline, homeOutline, settingsOutline } from 'ionicons/icons';

import { ItemStore } from '../services/item.store';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="categories" href="/tabs/categories">
          <ion-icon name="apps-outline"></ion-icon>
          <ion-label>Categories</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="expiring" href="/tabs/expiring">
          <ion-icon name="alarm-outline"></ion-icon>
          <ion-label>Expiring</ion-label>
          @if (alertCount()) {
            <ion-badge>{{ alertCount() }}</ion-badge>
          }
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon name="settings-outline"></ion-icon>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: `
    /* Floating pill tab bar */
    ion-tab-bar {
      --background: #ffffff;
      --border: 0;
      --color: #8c8c86;
      --color-selected: #1f4d3a;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(14px + env(safe-area-inset-bottom));
      width: min(560px, calc(100% - 28px));
      height: 78px;
      padding: 8px;
      border-radius: 28px;
      box-shadow: 0 12px 34px rgba(40, 40, 30, 0.12);
      contain: none;
    }
    ion-tab-button {
      --ripple-color: transparent;
      border-radius: 20px;
      font-family: var(--ion-font-family);
      transition: background .2s;
    }
    ion-tab-button.tab-selected { background: var(--epa-mint); }
    ion-tab-button ion-label { font-size: 12px; font-weight: 500; margin-top: 4px; }
    ion-tab-button ion-icon { font-size: 24px; }
    ion-badge {
      --background: #e0524a;
      --color: #fff;
      top: 6px;
      font-size: 10px;
      min-width: 18px;
    }
  `,
})
export class TabsPage {
  private readonly store = inject(ItemStore);
  protected readonly alertCount = computed(() => this.store.needsAttention().length);

  constructor() {
    addIcons({ homeOutline, appsOutline, alarmOutline, settingsOutline });
  }
}

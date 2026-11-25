import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonText],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Expiring soon</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="empty">
        <ion-icon name="notifications-outline"></ion-icon>
        <ion-text>
          <h2>Nothing expiring yet</h2>
          <p>Add your first item (groceries, medicine, Iqama, car insurance) and we'll remind you before it expires.</p>
        </ion-text>
      </div>
    </ion-content>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 30%;
      color: var(--ion-color-medium);
    }
    .empty ion-icon { font-size: 64px; margin-bottom: 12px; }
    h2 { color: var(--ion-text-color); }
  `,
})
export class HomePage {
  constructor() {
    addIcons({ notificationsOutline });
  }
}

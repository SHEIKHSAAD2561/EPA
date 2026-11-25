import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-settings',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonNote],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-list>
        <ion-item>
          <ion-label>Default reminders</ion-label>
          <ion-note slot="end">30, 7, 1 days before</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Reminder time</ion-label>
          <ion-note slot="end">9:00 AM</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Version</ion-label>
          <ion-note slot="end">0.1.0</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class SettingsPage {}

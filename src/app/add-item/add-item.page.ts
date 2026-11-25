import { Component } from '@angular/core';
import { IonContent, IonHeader, IonText, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-add-item',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonText],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Add item</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-text color="medium">
        <p>The add-item form (name, category, expiry date, reminders) comes next.</p>
      </ion-text>
    </ion-content>
  `,
})
export class AddItemPage {}

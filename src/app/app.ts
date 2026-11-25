import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) return;
    // Tapping a reminder opens that item
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const itemId = event.notification.extra?.itemId;
      if (itemId) {
        this.zone.run(() => this.router.navigate(['/item', itemId]));
      }
    });
  }
}

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AlertController, IonContent, IonToggle, ToastController } from '@ionic/angular';

import { ItemStore } from '../services/item.store';
import { ReminderService } from '../services/reminder.service';

@Component({
  selector: 'app-settings',
  imports: [IonContent, IonToggle],
  template: `
    <ion-content>
      <div class="page narrow">
        <header class="page-head">
          <div>
            <h1>Settings</h1>
            <p>Reminders, data and app info</p>
          </div>
        </header>

        <div class="section-head"><h2>Reminders</h2></div>
        <div class="card">
          <div class="row">
            <div>
              <div class="t">Notifications</div>
              <div class="s">{{ permissionText() }}</div>
            </div>
            <ion-toggle [checked]="store.settings().notificationsEnabled" (ionChange)="toggleNotifications($any($event).detail.checked)"></ion-toggle>
          </div>
          <div class="row col">
            <div class="t">Reminder time</div>
            <div class="s">When reminders arrive on the day they're due</div>
            <div class="chip-row scroll hours">
              @for (h of hours; track h) {
                <button class="chip" [class.selected]="store.settings().reminderHour === h" (click)="setHour(h)">{{ hourLabel(h) }}</button>
              }
            </div>
          </div>
          @if (reminders.isNative) {
            <div class="row">
              <div>
                <div class="t">Test notification</div>
                <div class="s">Sends one in 3 seconds</div>
              </div>
              <button class="btn mint" (click)="test()">Send</button>
            </div>
          }
        </div>

        <div class="section-head"><h2>Your data</h2></div>
        <div class="card">
          <div class="row">
            <div>
              <div class="t">Tracked items</div>
              <div class="s">{{ store.active().length }} active · {{ store.done().length }} done</div>
            </div>
          </div>
          <div class="row">
            <div>
              <div class="t">Demo items</div>
              <div class="s">Fill the app with examples to try it out</div>
            </div>
            <button class="btn mint" (click)="demo()">Load</button>
          </div>
          <div class="row">
            <div>
              <div class="t">Delete everything</div>
              <div class="s">Removes all items and reminders</div>
            </div>
            <button class="btn danger" (click)="clear()">Delete</button>
          </div>
        </div>

        <div class="section-head"><h2>About</h2></div>
        <div class="card">
          <div class="row">
            <div>
              <div class="t">EPA: Expiry Reminder</div>
              <div class="s">Your data stays on this phone.</div>
            </div>
            <span class="s">v0.2.0</span>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: `
    .narrow { max-width: 620px; }
    .card { background: var(--epa-surface); border-radius: var(--epa-radius); padding: 4px 16px; }
    .row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 14px 0; border-bottom: 1px solid var(--ion-border-color);
    }
    .row:last-child { border-bottom: 0; }
    .row.col { flex-direction: column; align-items: stretch; gap: 2px; }
    .t { font-weight: 500; }
    .s { font-size: 13px; color: var(--epa-muted); }
    .hours { margin-top: 10px; }
    ion-toggle { --track-background-checked: var(--epa-mint-strong); }
  `,
})
export class SettingsPage implements OnInit {
  protected readonly store = inject(ItemStore);
  protected readonly reminders = inject(ReminderService);
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);

  protected readonly hours = [6, 7, 8, 9, 10, 12, 15, 18, 20, 21];
  private readonly permission = signal<string>('unavailable');

  protected readonly permissionText = computed(() => {
    if (!this.store.settings().notificationsEnabled) return 'Off';
    switch (this.permission()) {
      case 'granted':
        return 'On · allowed by your phone';
      case 'denied':
        return 'Blocked. Allow notifications in phone settings.';
      case 'prompt':
        return "You'll be asked to allow notifications";
      default:
        return 'Only works in the Android/iOS app, not the browser';
    }
  });

  async ngOnInit(): Promise<void> {
    this.permission.set(await this.reminders.permissionState());
  }

  protected hourLabel(h: number): string {
    return new Date(2000, 0, 1, h).toLocaleTimeString('en-US', { hour: 'numeric' });
  }

  protected async toggleNotifications(on: boolean): Promise<void> {
    if (on) await this.reminders.requestPermission();
    await this.store.updateSettings({ notificationsEnabled: on });
    this.permission.set(await this.reminders.permissionState());
  }

  protected async setHour(h: number): Promise<void> {
    await this.store.updateSettings({ reminderHour: h });
    await this.toast(`Reminders will arrive at ${this.hourLabel(h)}`);
  }

  protected async test(): Promise<void> {
    if (await this.reminders.requestPermission()) {
      await this.reminders.sendTest();
      await this.toast('Test notification on its way…');
    } else {
      await this.toast('Notifications are blocked. Allow them in phone settings.');
    }
  }

  protected async demo(): Promise<void> {
    await this.store.loadDemoData();
    await this.toast('Demo items added');
  }

  protected async clear(): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Delete everything?',
      message: 'All items and reminders will be removed. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete all',
          role: 'destructive',
          handler: () => {
            this.store.clearAll().then(() => this.toast('All data deleted'));
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string): Promise<void> {
    const t = await this.toasts.create({ message, duration: 2000, position: 'top' });
    await t.present();
  }
}

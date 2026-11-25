# EPA: Smart Expiry & Forgotten Items Reminder

A mobile app that reminds you before things expire: groceries, medicines, Iqama, driving licence, car insurance, warranties and subscriptions.

Built with **Ionic 9 + Angular 22 + Capacitor 8**.

## Run it on your PC

Requirements: [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com).

```powershell
git clone https://github.com/SHEIKHSAAD2561/EPA.git
cd EPA
npm install
npm start
```

Open **http://localhost:8100** in your browser. Press **F12 → device toolbar (Ctrl+Shift+M)** to see it at phone size.

## Run it on Android

Requirements: [Android Studio](https://developer.android.com/studio) with an emulator, or a phone with USB debugging on.

First time only:

```powershell
npm install @capacitor/android
npx cap add android
```

Every time after that:

```powershell
npm run android
```

This builds the app, copies it into the Android project and opens Android Studio. Press the green **▶ Run** button.

## Features

- **Home dashboard**: needs-attention list, Pantry / Fridge / Freezer cards, "Expiring soon" carousel, category overview
- **7 categories**: Food, Medicine, Documents (Iqama, passport, licence), Vehicle (insurance, Istimara, Fahas), Warranties, Subscriptions, Other
- **Add / edit items**: category, name suggestions, icon, storage location, quantity and unit, expiry date with quick buttons, Hijri date preview, reminder choices, notes
- **Item details**: days left, Gregorian and Hijri dates, quantity stepper, and actions: *Used it*, *Threw it away*, *Renewed* (pick a new date), *Cancelled*, with undo
- **Expiring tab**: filters (this week, expired, 30 days, all, done), category filter and search, grouped by time
- **Reminders**: on-device notifications 30 / 14 / 7 / 3 / 2 / 1 / 0 days before, at the hour you choose; tapping one opens the item
- **Data stays on the phone** (Capacitor Preferences). Use *Settings → Demo items* to try it out

## Project structure

```
src/app/
  models/        Item and Settings types
  data/          Categories, locations, reminder options
  services/      item.store.ts (data + saving), reminder.service.ts (notifications)
  utils/         Date helpers (days left, labels, Hijri)
  components/    Item tile, item row, category card, "Add new item" button
  tabs/          Floating tab bar
  home/          Dashboard
  categories/    All categories
  category/      One category (with Pantry/Fridge/Freezer for food)
  expiring/      Filtered list of everything
  item-detail/   Item page with actions
  item-form/     Add / edit form
  settings/      Reminder time, notifications, demo data
src/theme/       Colors and fonts
```

## Android notification permissions

After `npx cap add android`, open `android/app/src/main/AndroidManifest.xml` and add these lines
inside `<manifest>` (above `<application>`) so reminders fire on time:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Notifications only work in the Android/iOS app. In the browser everything else works.

## Roadmap

- [x] App shell with tabs
- [x] Add / edit / delete items
- [x] Save items on the device
- [x] Local notifications before expiry
- [x] Used / renewed / cancelled actions with undo
- [x] Hijri date display
- [ ] Barcode scanning for groceries
- [ ] OCR for document expiry dates
- [ ] Arabic language and RTL layout
- [ ] NestJS backend sync, email and WhatsApp reminders

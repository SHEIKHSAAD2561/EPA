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

## Project structure

```
src/app/
  tabs/        Bottom tab bar (Expiring · Add item · Settings)
  home/        "Expiring soon" list
  add-item/    Add an item with its expiry date
  settings/    Reminder settings
src/theme/     App colors
capacitor.config.ts   App id and name for Android/iOS
```

## Roadmap

- [x] App shell with tabs
- [ ] Add item form (name, category, expiry date)
- [ ] Save items on the device
- [ ] Local notifications 30, 7 and 1 day before expiry
- [ ] Renew / consume / cancel actions
- [ ] Hijri date support
- [ ] Barcode scanning for groceries
- [ ] OCR for document expiry dates
- [ ] NestJS backend sync, email and WhatsApp reminders

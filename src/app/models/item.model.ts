export type CategoryId =
  | 'food'
  | 'medicine'
  | 'documents'
  | 'vehicle'
  | 'warranty'
  | 'subscription'
  | 'other';

export type LocationId = 'pantry' | 'fridge' | 'freezer';

/** active = still being tracked. The others are "done" states kept for history. */
export type ItemStatus = 'active' | 'used' | 'discarded' | 'renewed' | 'cancelled';

export interface Item {
  id: string;
  /** Small integer used to build notification ids (Android needs 32-bit ints). */
  nid: number;
  name: string;
  emoji: string;
  categoryId: CategoryId;
  location?: LocationId;
  quantity: number;
  unit?: string;
  /** Local date, YYYY-MM-DD */
  expiryDate: string;
  /** Remind this many days before expiry (0 = on the day). */
  reminderDays: number[];
  notes?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  /** Set when the item leaves the active list. */
  closedAt?: string;
}

export type NewItem = Omit<Item, 'id' | 'nid' | 'status' | 'createdAt' | 'updatedAt' | 'closedAt'>;

export interface Settings {
  /** Hour of day (0-23) to send reminders. */
  reminderHour: number;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  reminderHour: 9,
  notificationsEnabled: true,
};

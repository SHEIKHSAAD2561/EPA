import { CategoryId, LocationId } from '../models/item.model';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Pastel background for tiles */
  tint: string;
  /** Stronger color for gradients and accents */
  accent: string;
  description: string;
  defaultReminderDays: number[];
  /** Whether quantity/unit make sense for this category */
  hasQuantity: boolean;
  /** What "finishing" an item means: consume it, or renew it */
  lifecycle: 'consume' | 'renew';
  emojiSuggestions: string[];
  nameSuggestions: string[];
  /** Quick buttons to set the expiry date, in days from today */
  quickDates: { label: string; days: number }[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food',
    emoji: '🥑',
    tint: '#D9F2E3',
    accent: '#3FA37A',
    description: 'Groceries in your pantry, fridge and freezer',
    defaultReminderDays: [2, 0],
    hasQuantity: true,
    lifecycle: 'consume',
    emojiSuggestions: ['🥛', '🧀', '🥚', '🍞', '🥐', '🍌', '🍎', '🥑', '🥒', '🍅', '🥩', '🍗', '🐟', '🍦', '🧃', '🥫'],
    nameSuggestions: ['Milk', 'Laban', 'Eggs', 'Bread', 'Cheese', 'Chicken', 'Yogurt', 'Dates'],
    quickDates: [
      { label: '3 days', days: 3 },
      { label: '1 week', days: 7 },
      { label: '2 weeks', days: 14 },
      { label: '1 month', days: 30 },
      { label: '6 months', days: 182 },
    ],
  },
  {
    id: 'medicine',
    name: 'Medicine',
    emoji: '💊',
    tint: '#F7DDE6',
    accent: '#D0587E',
    description: 'Tablets, syrups, first-aid and prescriptions',
    defaultReminderDays: [30, 7],
    hasQuantity: true,
    lifecycle: 'consume',
    emojiSuggestions: ['💊', '🩹', '💉', '🧴', '🌡️', '🩺', '🧪', '👁️'],
    nameSuggestions: ['Panadol', 'Vitamin D', 'Cough syrup', 'Eye drops', 'Antibiotic', 'First-aid kit'],
    quickDates: [
      { label: '1 month', days: 30 },
      { label: '3 months', days: 91 },
      { label: '6 months', days: 182 },
      { label: '1 year', days: 365 },
      { label: '2 years', days: 730 },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    emoji: '🪪',
    tint: '#D8E7F8',
    accent: '#3D7CC9',
    description: 'Iqama, passport, driving licence, visas',
    defaultReminderDays: [30, 7, 1],
    hasQuantity: false,
    lifecycle: 'renew',
    emojiSuggestions: ['🪪', '🛂', '📘', '📄', '🎓', '🏥', '✈️', '🏠'],
    nameSuggestions: ['Iqama', 'Passport', 'Driving licence', 'National ID', 'Exit re-entry visa', 'Health insurance card'],
    quickDates: [
      { label: '3 months', days: 91 },
      { label: '1 year', days: 365 },
      { label: '2 years', days: 730 },
      { label: '5 years', days: 1826 },
      { label: '10 years', days: 3652 },
    ],
  },
  {
    id: 'vehicle',
    name: 'Vehicle',
    emoji: '🚗',
    tint: '#F8DFCF',
    accent: '#E07B45',
    description: 'Insurance, registration, inspection, service',
    defaultReminderDays: [30, 7, 1],
    hasQuantity: false,
    lifecycle: 'renew',
    emojiSuggestions: ['🚗', '🛡️', '📋', '🔧', '🛞', '🛢️', '🔋', '🚙'],
    nameSuggestions: ['Car insurance', 'Istimara (registration)', 'Fahas (inspection)', 'Oil change', 'Tyre change', 'Battery'],
    quickDates: [
      { label: '3 months', days: 91 },
      { label: '6 months', days: 182 },
      { label: '1 year', days: 365 },
      { label: '2 years', days: 730 },
      { label: '3 years', days: 1095 },
    ],
  },
  {
    id: 'warranty',
    name: 'Warranties',
    emoji: '🧾',
    tint: '#F7EDC6',
    accent: '#C49A1A',
    description: 'Electronics, appliances and receipts',
    defaultReminderDays: [30, 7],
    hasQuantity: false,
    lifecycle: 'renew',
    emojiSuggestions: ['🧾', '📱', '💻', '📺', '🎧', '⌚', '🧊', '🧺'],
    nameSuggestions: ['iPhone warranty', 'Laptop warranty', 'TV warranty', 'Washing machine', 'AC warranty', 'AppleCare'],
    quickDates: [
      { label: '6 months', days: 182 },
      { label: '1 year', days: 365 },
      { label: '2 years', days: 730 },
      { label: '3 years', days: 1095 },
      { label: '5 years', days: 1826 },
    ],
  },
  {
    id: 'subscription',
    name: 'Subscriptions',
    emoji: '🔁',
    tint: '#E6DEF6',
    accent: '#7B5BC7',
    description: 'Free trials, memberships and renewals',
    defaultReminderDays: [3, 1],
    hasQuantity: false,
    lifecycle: 'renew',
    emojiSuggestions: ['🔁', '🎬', '🎵', '☁️', '🏋️', '📰', '🎮', '📶'],
    nameSuggestions: ['Netflix', 'Shahid', 'Spotify', 'iCloud', 'Gym membership', 'Mobile package', 'Free trial'],
    quickDates: [
      { label: '7 days', days: 7 },
      { label: '14 days', days: 14 },
      { label: '1 month', days: 30 },
      { label: '3 months', days: 91 },
      { label: '1 year', days: 365 },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '📦',
    tint: '#E9E9E4',
    accent: '#6F6F68',
    description: 'Anything else with a date',
    defaultReminderDays: [7, 1],
    hasQuantity: true,
    lifecycle: 'renew',
    emojiSuggestions: ['📦', '🧯', '💧', '🔑', '🎟️', '🐾', '🪴', '🧸'],
    nameSuggestions: ['Water filter', 'Fire extinguisher', 'Event ticket', 'Pet vaccine', 'Coupon'],
    quickDates: [
      { label: '1 week', days: 7 },
      { label: '1 month', days: 30 },
      { label: '3 months', days: 91 },
      { label: '6 months', days: 182 },
      { label: '1 year', days: 365 },
    ],
  },
];

export interface StorageLocation {
  id: LocationId;
  name: string;
  emoji: string;
  gradient: string;
}

export const LOCATIONS: StorageLocation[] = [
  { id: 'pantry', name: 'Pantry', emoji: '🫙', gradient: 'linear-gradient(160deg, #E9C79A 0%, #B9824A 100%)' },
  { id: 'fridge', name: 'Fridge', emoji: '🧊', gradient: 'linear-gradient(160deg, #B8D7E8 0%, #5D8BA8 100%)' },
  { id: 'freezer', name: 'Freezer', emoji: '❄️', gradient: 'linear-gradient(160deg, #C9D6F2 0%, #6A79B8 100%)' },
];

export const REMINDER_OPTIONS = [
  { days: 30, label: '30 days' },
  { days: 14, label: '2 weeks' },
  { days: 7, label: '1 week' },
  { days: 3, label: '3 days' },
  { days: 2, label: '2 days' },
  { days: 1, label: '1 day' },
  { days: 0, label: 'On the day' },
];

export const UNITS = ['pcs', 'pack', 'kg', 'g', 'L', 'ml', 'box', 'bottle', 'tablets'];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));
export function getCategory(id: CategoryId): Category {
  return byId.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}

const locById = new Map(LOCATIONS.map((l) => [l.id, l]));
export function getLocation(id?: LocationId): StorageLocation | undefined {
  return id ? locById.get(id) : undefined;
}

/** Pastel backgrounds rotated across food items, like a grocery shelf. */
const FOOD_PASTELS = ['#F7EDC6', '#D9F2E3', '#F8DCCD', '#DDEBF8', '#EDE3F7', '#F7DDE6'];

/** Tile background for an item: varied pastels for food, category tint for the rest. */
export function tintFor(item: { name: string; categoryId: CategoryId }): string {
  if (item.categoryId !== 'food') return getCategory(item.categoryId).tint;
  let h = 0;
  for (const ch of item.name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FOOD_PASTELS[h % FOOD_PASTELS.length];
}

/** "30 days, 1 week and 1 day before" / "on the day" */
export function describeReminders(days: number[]): string {
  if (!days.length) return 'No reminders';
  const sorted = [...days].sort((a, b) => b - a);
  const before = sorted.filter((d) => d > 0).map((d) => REMINDER_OPTIONS.find((o) => o.days === d)?.label ?? `${d} days`);
  const parts: string[] = [];
  if (before.length) {
    const list = before.length > 1 ? `${before.slice(0, -1).join(', ')} and ${before.at(-1)}` : before[0];
    parts.push(`${list} before`);
  }
  if (sorted.includes(0)) parts.push('on the day');
  const text = parts.join(', and ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

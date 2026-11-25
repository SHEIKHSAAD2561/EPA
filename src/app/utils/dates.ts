/** Date helpers. All expiry dates are stored as local "YYYY-MM-DD" strings. */

export function todayStr(): string {
  return toDateStr(new Date());
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse "YYYY-MM-DD" as a local date at midnight. */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, days: number): string {
  const d = parseDateStr(s);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/** Whole days from today until the date. Negative = already expired. */
export function daysLeft(expiry: string): number {
  const ms = parseDateStr(expiry).getTime() - parseDateStr(todayStr()).getTime();
  return Math.round(ms / 86_400_000);
}

export type Urgency = 'expired' | 'today' | 'urgent' | 'soon' | 'ok';

export function urgency(expiry: string): Urgency {
  const d = daysLeft(expiry);
  if (d < 0) return 'expired';
  if (d === 0) return 'today';
  if (d <= 3) return 'urgent';
  if (d <= 30) return 'soon';
  return 'ok';
}

/** "Expiring in 3 days", "Expires today", "Expired 2 days ago" */
export function expiryLabel(expiry: string): string {
  const d = daysLeft(expiry);
  if (d < -1) return `Expired ${-d} days ago`;
  if (d === -1) return 'Expired yesterday';
  if (d === 0) return 'Expires today';
  if (d === 1) return 'Expires tomorrow';
  if (d < 60) return `Expiring in ${d} days`;
  const months = Math.round(d / 30.4);
  if (months < 24) return `Expiring in ${months} months`;
  return `Expiring in ${Math.round(d / 365)} years`;
}

/** Compact badge text: "3d", "Today", "-2d", "4mo" */
export function shortLeft(expiry: string): string {
  const d = daysLeft(expiry);
  if (d === 0) return 'Today';
  if (d < 0) return `${d}d`;
  if (d < 60) return `${d}d`;
  if (d < 730) return `${Math.round(d / 30.4)}mo`;
  return `${Math.round(d / 365)}y`;
}

export function formatDate(s: string): string {
  return parseDateStr(s).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Same date in the Umm al-Qura (Saudi) Hijri calendar. */
export function formatHijri(s: string): string {
  try {
    return parseDateStr(s).toLocaleDateString('en-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

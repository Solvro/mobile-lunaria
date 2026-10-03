import type { Prediction } from '@/api/types';

export type DayKind = 'period' | 'predicted' | 'predicted_ovulation' | null;

export type DayInfo = {
  kind: DayKind;
  intimacy: boolean;
  logged: boolean;
};

export type DayRecordLike = { date: string; is_period?: boolean; intimacy?: boolean };

// Local-time ISO date (YYYY-MM-DD); toISOString() would shift dates near midnight.
export function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysBetween(from: string, to: string) {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

export function todayIso() {
  return isoDate(new Date());
}

type Range = { start: string; end: string };

// The API only returns the next cycle; repeat it forward so later months are filled in too.
function projectedRanges(prediction: Prediction, cycles = 4) {
  const shift = (iso: string, cycle: number) => isoDate(addDays(parseDate(iso), cycle * prediction.average_cycle_length));
  const periods: Range[] = [];
  const fertile: Range[] = [];
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    periods.push({ start: shift(prediction.next_period_start, cycle), end: shift(prediction.next_period_end, cycle) });
    fertile.push({ start: shift(prediction.fertile_window_start, cycle), end: shift(prediction.fertile_window_end, cycle) });
  }
  return { periods, fertile };
}

const within = (iso: string, ranges: Range[]) => ranges.some((range) => iso >= range.start && iso <= range.end);

export function dayClassifier(records: DayRecordLike[], prediction: Prediction | null) {
  const byDate = new Map(records.map((record) => [record.date, record]));
  const projection = prediction ? projectedRanges(prediction) : null;
  const today = todayIso();
  return (iso: string): DayInfo => {
    const record = byDate.get(iso);
    let kind: DayKind = null;
    if (record?.is_period) kind = 'period';
    else if (projection && iso >= today && within(iso, projection.periods)) kind = 'predicted';
    else if (projection && iso >= today && within(iso, projection.fertile)) kind = 'predicted_ovulation';
    return { kind, intimacy: !!record?.intimacy, logged: !!record };
  };
}

// How many consecutive logged period days end on `iso` (1 = first day).
export function periodDayNumber(records: DayRecordLike[], iso: string) {
  const periodDays = new Set(records.filter((record) => record.is_period).map((record) => record.date));
  let count = 0;
  let cursor = parseDate(iso);
  while (periodDays.has(isoDate(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

// Today's period day. If today isn't logged yet but yesterday was a period day, the period
// is probably still going on, so count today as the next day (unconfirmed) – unless that
// would make it longer than usual, or the caller wants confirmed days only.
export function currentPeriod(records: DayRecordLike[], { usualLength, confirmedOnly = false }: { usualLength?: number; confirmedOnly?: boolean } = {}) {
  const today = todayIso();
  const loggedToday = records.some((record) => record.date === today);
  const day = periodDayNumber(records, today);
  if (day > 0 || loggedToday || confirmedOnly) return { day, confirmed: true };
  const next = periodDayNumber(records, isoDate(addDays(new Date(), -1))) + 1;
  const ongoing = next > 1 && next <= (usualLength ?? 7) + 2;
  return { day: ongoing ? next : 0, confirmed: false };
}

// Records from a few weeks back up to today; enough to tell where today is in a period.
export function recentRange() {
  return { start: isoDate(addDays(new Date(), -21)), end: todayIso() };
}

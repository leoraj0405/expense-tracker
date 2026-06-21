/** API / query date format: YYYY-MM-DD */
export const API_DATE_FORMAT = 'YYYY-MM-DD';

export interface DateRangeInput {
  startDate?: string;
  endDate?: string;
  /** Legacy month filter: YYYY-MM */
  month?: string;
}

export interface ResolvedDateRange {
  start: Date;
  end: Date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Parse YYYY-MM-DD or YYYY-MM as local calendar dates (avoids UTC shift). */
export function parseLocalDate(dateStr: string): Date {
  const isoDay = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    return new Date(+isoDay[1], +isoDay[2] - 1, +isoDay[3]);
  }

  const isoMonth = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) {
    return new Date(+isoMonth[1], +isoMonth[2] - 1, 1);
  }

  return new Date(dateStr);
}

export function getMonthBounds(yearMonth: string): ResolvedDateRange {
  const [year, month] = yearMonth.split('-').map(Number);
  return {
    start: startOfDay(new Date(year, month - 1, 1)),
    end: endOfDay(new Date(year, month, 0)),
  };
}

export function getCurrentMonthBounds(): ResolvedDateRange {
  const now = new Date();
  return {
    start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

/**
 * Resolve expense list date range from query params.
 * Priority: explicit start/end → month (YYYY-MM) → current calendar month.
 */
export function resolveExpenseDateRange(
  input: DateRangeInput = {},
): ResolvedDateRange {
  const { startDate, endDate, month } = input;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return getMonthBounds(month);
  }

  if (startDate || endDate) {
    const now = new Date();
    const start = startDate
      ? startOfDay(parseLocalDate(startDate))
      : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

    let end = endDate
      ? endOfDay(parseLocalDate(endDate))
      : endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    if (end < start) {
      end = endOfDay(start);
    }

    return { start, end };
  }

  return getCurrentMonthBounds();
}

export function getPreviousMonthBounds(
  reference: Date = new Date(),
): ResolvedDateRange {
  const y = reference.getFullYear();
  const m = reference.getMonth();
  return {
    start: startOfDay(new Date(y, m - 1, 1)),
    end: endOfDay(new Date(y, m, 0)),
  };
}

/** Format Date as YYYY-MM-DD (local). */
export function formatApiDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Matches server API_DATE_FORMAT */
export const API_DATE_FORMAT = 'YYYY-MM-DD';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const isoDay = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    return new Date(+isoDay[1], +isoDay[2] - 1, +isoDay[3]);
  }

  const isoMonth = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) {
    return new Date(+isoMonth[1], +isoMonth[2] - 1, 1);
  }

  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** YYYY-MM-DD for API query params and `<input type="date">`. */
export function toInputDate(dateStr: string | Date): string {
  const d = dateStr instanceof Date ? dateStr : parseLocalDate(dateStr);
  if (!d) return '';

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Human-readable display: 15 Jun 2025 */
export function formatDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return '—';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function todayInputDate(): string {
  return toInputDate(new Date());
}

export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return {
    startDate: toInputDate(new Date(y, m, 1)),
    endDate: toInputDate(new Date(y, m + 1, 0)),
  };
}

export function getMonthRange(yearMonth: string): DateRange | null {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) return null;

  const [y, m] = yearMonth.split('-').map(Number);
  return {
    startDate: `${yearMonth}-01`,
    endDate: toInputDate(new Date(y, m, 0)),
  };
}

export function resolveInitialDateRange(params: {
  startDate?: string | null;
  endDate?: string | null;
  month?: string | null;
}): DateRange {
  if (params.startDate && params.endDate) {
    return { startDate: params.startDate, endDate: params.endDate };
  }

  if (params.month) {
    const monthRange = getMonthRange(params.month);
    if (monthRange) return monthRange;
  }

  return getCurrentMonthRange();
}

export type DatePreset =
  | 'today'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'last3Months'
  | 'thisYear'
  | 'custom'

export function getDateRangeForPreset(
  preset: DatePreset,
  custom?: DateRange,
): DateRange {
  const now = new Date();
  const today = toInputDate(now);

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { startDate: toInputDate(start), endDate: today };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { startDate: toInputDate(start), endDate: today };
    }
    case 'thisMonth':
      return getCurrentMonthRange();
    case 'last3Months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { startDate: toInputDate(start), endDate: today };
    }
    case 'thisYear':
      return {
        startDate: toInputDate(new Date(now.getFullYear(), 0, 1)),
        endDate: today,
      };
    case 'custom':
      return custom ?? getCurrentMonthRange();
    default:
      return getCurrentMonthRange();
  }
}

export function detectDatePreset(range: DateRange): DatePreset {
  const presets: DatePreset[] = [
    'today',
    'last7',
    'last30',
    'thisMonth',
    'last3Months',
    'thisYear',
  ];

  for (const preset of presets) {
    const expected = getDateRangeForPreset(preset);
    if (
      expected.startDate === range.startDate &&
      expected.endDate === range.endDate
    ) {
      return preset;
    }
  }

  return 'custom';
}

/** Compact range label: "1 Feb - 18 Apr" */
export function formatShortDateRange(range: DateRange): string {
  const start = parseLocalDate(range.startDate);
  const end = parseLocalDate(range.endDate);
  if (!start || !end) return '';

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-IN', opts);
  const endStr = end.toLocaleDateString('en-IN', opts);
  return `${startStr} - ${endStr}`;
}

export function getPresetLabel(preset: DatePreset): string {
  const labels: Record<DatePreset, string> = {
    today: 'Today',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    thisMonth: 'This month',
    last3Months: 'Last 3 months',
    thisYear: 'This year',
    custom: 'Custom',
  };
  return labels[preset];
}

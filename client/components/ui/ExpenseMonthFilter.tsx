'use client';

import { MonthPickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import {
  getCurrentMonthRange,
  getMonthRange,
  parseLocalDate,
  toInputDate,
} from '@/utils/date';

interface ExpenseMonthFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export function ExpenseMonthFilter({ startDate, onChange }: ExpenseMonthFilterProps) {
  const monthValue = parseLocalDate(startDate);

  return (
    <MonthPickerInput
      label="Filter by month"
      placeholder="This month"
      value={monthValue}
      onChange={(date) => {
        if (!date) {
          const range = getCurrentMonthRange();
          onChange(range.startDate, range.endDate);
          return;
        }
        const yearMonth = toInputDate(date).slice(0, 7);
        const range = getMonthRange(yearMonth);
        if (range) onChange(range.startDate, range.endDate);
      }}
      maxDate={new Date()}
      leftSection={<IconCalendar size={16} stroke={1.75} />}
      clearable
      w={{ base: '100%', sm: 280 }}
    />
  );
}

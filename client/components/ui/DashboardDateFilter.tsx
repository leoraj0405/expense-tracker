'use client';

import { useState } from 'react';
import { Popover, Button, Stack, Group, Text } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import {
  type DatePreset,
  type DateRange,
  getDateRangeForPreset,
  formatShortDateRange,
  formatDisplayDate,
  parseLocalDate,
  toInputDate,
} from '@/utils/date';

interface DashboardDateFilterProps {
  preset: DatePreset;
  range: DateRange;
  onChange: (preset: DatePreset, range: DateRange) => void;
  disabled?: boolean;
}

const STANDARD_PRESETS: { id: Exclude<DatePreset, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'last3Months', label: 'Last 3 months' },
  { id: 'thisYear', label: 'This year' },
];

type DraftRange = [Date | null, Date | null];

function toPickerDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') return parseLocalDate(value);
  return null;
}

function rangeFromDates(range: DateRange): DraftRange {
  return [parseLocalDate(range.startDate), parseLocalDate(range.endDate)];
}

export function DashboardDateFilter({
  preset,
  range,
  onChange,
  disabled,
}: DashboardDateFilterProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DraftRange>(rangeFromDates(range));

  const openCustomPicker = () => {
    setDraftRange(rangeFromDates(range));
    setCustomOpen(true);
  };

  const handlePresetClick = (id: Exclude<DatePreset, 'custom'>) => {
    setCustomOpen(false);
    onChange(id, getDateRangeForPreset(id));
  };

  const applyCustomRange = () => {
    const start = toPickerDate(draftRange[0]);
    const end = toPickerDate(draftRange[1]);
    if (!start || !end) return;

    const orderedStart = start <= end ? start : end;
    const orderedEnd = start <= end ? end : start;

    onChange('custom', {
      startDate: toInputDate(orderedStart),
      endDate: toInputDate(orderedEnd),
    });
    setCustomOpen(false);
  };

  const [draftStart, draftEnd] = draftRange;
  const canApply = Boolean(draftStart && draftEnd);

  const customLabel =
    preset === 'custom'
      ? `Custom · ${formatShortDateRange(range)}`
      : 'Custom';

  const draftSummary =
    draftStart && draftEnd
      ? `${formatDisplayDate(toInputDate(draftStart))} – ${formatDisplayDate(toInputDate(draftEnd))}`
      : draftStart
        ? `${formatDisplayDate(toInputDate(draftStart))} – pick end date`
        : 'Pick start and end dates';

  return (
    <div className="et-date-filters" role="group" aria-label="Date range">
      {STANDARD_PRESETS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`et-date-filter-btn${preset === id ? ' is-active' : ''}`}
          onClick={() => handlePresetClick(id)}
          disabled={disabled}
          aria-pressed={preset === id}
        >
          {label}
        </button>
      ))}

      <Popover
        opened={customOpen}
        onChange={setCustomOpen}
        position="bottom-end"
        shadow="md"
        radius="md"
        width={320}
        closeOnClickOutside={false}
        closeOnEscape
        trapFocus={false}
      >
        <Popover.Target>
          <button
            type="button"
            className={`et-date-filter-btn${preset === 'custom' ? ' is-active' : ''}`}
            onClick={openCustomPicker}
            disabled={disabled}
            aria-pressed={preset === 'custom'}
            aria-expanded={customOpen}
          >
            {customLabel}
          </button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Custom range
            </Text>
            <Text size="xs" c="dimmed">
              {draftSummary}
            </Text>
            <DatePicker
              type="range"
              value={draftRange}
              onChange={(value) => {
                const next = value as DraftRange;
                setDraftRange([
                  toPickerDate(next[0]),
                  toPickerDate(next[1]),
                ]);
              }}
              maxDate={new Date()}
              allowSingleDateInRange
            />
            <Group justify="flex-end" gap="xs">
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setCustomOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                color="navy"
                disabled={!canApply}
                onClick={applyCustomRange}
              >
                Apply
              </Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}

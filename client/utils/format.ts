import { formatDisplayDate, parseLocalDate } from './date';

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  if (!date) return formatDisplayDate(dateStr);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  return formatDisplayDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const CHART_COLORS = ['#2f8f5b', '#6a63d1', '#e8a23d', '#c0503c', '#1c2a3a'];

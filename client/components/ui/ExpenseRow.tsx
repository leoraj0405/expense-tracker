'use client';

import { formatCurrency, formatRelativeDate } from '@/utils/format';

interface ExpenseRowProps {
  name: string;
  category: string;
  date: string;
  amount: number;
  emoji?: string;
  color?: string;
}

export function ExpenseRow({ name, category, date, amount, emoji = '💸', color = '#6a63d1' }: ExpenseRowProps) {
  return (
    <div className="et-expense-row">
      <div className="et-expense-icon" style={{ background: color, color: '#fff' }}>
        {emoji}
      </div>
      <div className="et-expense-mid">
        <div className="et-expense-name">{name}</div>
        <div className="et-expense-meta">
          {category} · {formatRelativeDate(date)}
        </div>
      </div>
      <div className="et-expense-amt">{formatCurrency(amount)}</div>
    </div>
  );
}

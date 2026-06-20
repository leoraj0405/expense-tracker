import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaClass?: string;
  icon: ReactNode;
  iconStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

export function StatCard({
  label,
  value,
  delta,
  deltaClass = '',
  icon,
  iconStyle,
  valueStyle,
}: StatCardProps) {
  return (
    <div className="et-stat-card">
      <div className="et-stat-top">
        <span className="et-stat-label">{label}</span>
        <div className="et-stat-icon" style={iconStyle}>
          {icon}
        </div>
      </div>
      <div className="et-stat-value" style={valueStyle}>
        {value}
      </div>
      {delta && <div className={`et-stat-delta ${deltaClass}`}>{delta}</div>}
    </div>
  );
}

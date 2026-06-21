'use client';

import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, hint, action, children, className = '' }: PanelProps) {
  return (
    <div className={`et-panel ${className}`.trim()}>
      <div className="et-panel-head">
        <div>
          <h3>{title}</h3>
          {hint && <div className="et-hint">{hint}</div>}
        </div>
        {action}
      </div>
      <div className="et-panel-body">{children}</div>
    </div>
  );
}

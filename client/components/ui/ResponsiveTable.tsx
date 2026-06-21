'use client';

import type { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  minWidth?: number;
}

export function ResponsiveTable({ children, minWidth = 560 }: ResponsiveTableProps) {
  return (
    <div
      className="et-table-wrap"
      style={{ ['--et-table-min' as string]: `${minWidth}px` }}
    >
      <table className="et-gtable et-gtable-responsive">{children}</table>
    </div>
  );
}

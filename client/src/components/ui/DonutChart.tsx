interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
}

export function DonutChart({ segments, size = 150 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 15.9;
  const circumference = 2 * Math.PI * radius;
  let offset = circumference * 0.25;

  const circles =
    total === 0 ? (
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="var(--et-line)"
        strokeWidth="4"
      />
    ) : (
      segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset -= dash;
        return (
          <circle
            key={`${seg.name}-${i}`}
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="4"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={currentOffset}
            strokeLinecap="round"
          />
        );
      })
    );

  return (
    <div className="et-chart-wrap">
      <svg width={size} height={size} viewBox="0 0 36 36">
        {total > 0 && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="var(--et-line)"
            strokeWidth="4"
          />
        )}
        {circles}
      </svg>
      <div className="et-legend">
        {segments.length === 0 ? (
          <p className="et-empty-note">No category data</p>
        ) : (
          segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div className="et-legend-row" key={seg.name}>
                <span className="et-legend-dot" style={{ background: seg.color }} />
                <span className="et-legend-name">{seg.name}</span>
                <span className="et-legend-pct">{pct}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

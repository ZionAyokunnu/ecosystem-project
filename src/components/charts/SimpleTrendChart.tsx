import React from 'react';

interface SimpleTrendChartProps {
  data: Array<{ year: number; value: number }>;
  height?: number;
  color?: string;
}

export const SimpleTrendChart: React.FC<SimpleTrendChartProps> = ({
  data,
  height = 120,
  color = "#3B82F6"
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No trend data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = ((maxValue - d.value) / valueRange) * 80 + 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = ((maxValue - d.value) / valueRange) * 80 + 10;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.year}</span>
        ))}
      </div>
    </div>
  );
};

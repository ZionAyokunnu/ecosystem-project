
import React from 'react';
import { Indicator } from '@/types';

interface SunburstCenterCircleProps {
  coreIndicator: Indicator | null;
  pivotId: string | null;
  radius: number;
}

const SunburstCenterCircle: React.FC<SunburstCenterCircleProps> = ({
  coreIndicator,
  pivotId,
  radius
}) => {
  if (!coreIndicator) return null;

  const getScoreColor = (value: number) => {
    if (value >= 75) return '#22c55e'; // green
    if (value >= 50) return '#eab308'; // yellow
    if (value >= 25) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const backgroundColor = getScoreColor(coreIndicator.current_value);

  return (
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-white font-bold"
      style={{
        width: radius * 2,
        height: radius * 2,
        backgroundColor: backgroundColor + '80', // 50% opacity
        border: `3px solid ${backgroundColor}`,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="text-xs uppercase tracking-wide opacity-90">
        {coreIndicator.category}
      </div>
      <div className="text-lg font-bold">
        {coreIndicator.current_value.toFixed(1)}
      </div>
      <div className="text-xs text-center px-2 opacity-90">
        {coreIndicator.name}
      </div>
      {pivotId && (
        <div className="text-xs mt-1 opacity-75">
          ID: {pivotId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
};

export default SunburstCenterCircle;
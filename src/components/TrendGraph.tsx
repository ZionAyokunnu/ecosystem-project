
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PredictionResult } from '@/types';
import { getBenchmark, Benchmark } from '@/services/benchmarksApi';

interface TrendGraphProps {
  predictionData: PredictionResult;
  onYearClick?: (year: number) => void;
  title: string;
  locationName: string;
  unitLabel: string;
  indicatorId?: string;
}

const TrendGraph: React.FC<TrendGraphProps> = ({ 
  predictionData, 
  onYearClick, 
  title, 
  locationName, 
  unitLabel,
  indicatorId
}) => {
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);

  useEffect(() => {
    if (indicatorId) {
      getBenchmark(indicatorId).then(setBenchmark);
    }
  }, [indicatorId]);

  if (!predictionData || !predictionData.years || !predictionData.values) return null;
  
  const { years, values } = predictionData;
  const optimalBenchmark = benchmark?.target_value;

  // Build one record per year with separate keys so Recharts can draw two distinct lines
  const currentYear = new Date().getFullYear();
  const chartData = years.map((year, i) => ({
    year,
    historicalValue: year <= currentYear ? values[i] : null,
    predictedValue: year >= currentYear ? values[i] : null
  }));

  // Compute directional overlay color based on optimal benchmark
  const currentValue = values[years.findIndex(y => y === currentYear)] || values[0];
  const isImproving = optimalBenchmark ? currentValue >= optimalBenchmark : false;
  const overlayColor = isImproving ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const gap = optimalBenchmark ? Math.abs(currentValue - optimalBenchmark).toFixed(1) : null;

  return (
    <div className="bg-white shadow rounded-lg p-6" role="img" aria-label={`${title} trend chart for ${locationName}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 subtitle">
          {title} in {locationName} ({unitLabel})
        </p>
        {benchmark && (
          <p className="text-xs text-blue-600 mt-1">
            Benchmark: {benchmark.target_value}{unitLabel} | 
            You are at {currentValue}% vs UN target of {benchmark.target_value}% 
            ({gap}% gap)
          </p>
        )}
      </div>

      <div className="h-64 relative">
        {/* Directional overlay */}
        <div 
          className="absolute inset-0 rounded"
          style={{ backgroundColor: overlayColor }}
          aria-hidden="true"
        />
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              if (e && typeof e.activeLabel === 'number' && onYearClick) {
                onYearClick(e.activeLabel);
              }
            }}
            aria-label={`Line chart showing ${title} data over time`}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              aria-label="Years"
            />
            <YAxis 
              domain={[0, 100]} 
              tickFormatter={v => `${v}%`}
              aria-label={`${title} percentage`}
            />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Legend />
            {benchmark && (
              <ReferenceLine 
                y={benchmark.target_value} 
                stroke="#f59e0b" 
                strokeDasharray="8 8"
                label={{ value: `Target: ${benchmark.target_value}%`, position: "topLeft" }}
              />
            )}
            <Line
              type="monotone"
              dataKey="historicalValue"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Historical"
              connectNulls
              isAnimationActive={true}
              animationDuration={800}
              style={{ cursor: 'pointer' }}
            />
            <Line
              type="monotone"
              dataKey="predictedValue"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Predicted"
              connectNulls
              isAnimationActive={true}
              animationDuration={800}
              style={{ cursor: 'pointer' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini-legend for directional overlay */}
      <div className="mt-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>■ Green = Improvement</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>■ Red = Decline</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-1">Trend Analysis</h3>
        <p className="text-blue-600">{predictionData.summary}</p>
      </div>
    </div>
  );
}

export default TrendGraph;

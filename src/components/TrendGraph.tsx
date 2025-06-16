
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PredictionResult } from '@/types';

interface TrendGraphProps {
  predictionData: PredictionResult;
  onYearClick?: (year: number) => void;   // optional drill‑down handler
}

const TrendGraph: React.FC<TrendGraphProps> = ({ predictionData, onYearClick }) => {
  if (!predictionData || !predictionData.years || !predictionData.values) return null;
  const { years, values } = predictionData;

  // Build one record per year with separate keys so Recharts can draw two distinct lines
  const currentYear = new Date().getFullYear();
  const chartData = years.map((year, i) => ({
    year,
    historicalValue: year <= currentYear ? values[i] : null,
    predictedValue: year >= currentYear ? values[i] : null
  }));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historical & Predicted Trends</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              // e.activeLabel is the x‑axis label (year) that was clicked
              if (e && typeof e.activeLabel === 'number' && onYearClick) {
                onYearClick(e.activeLabel);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
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
              cursor="pointer"
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
              cursor="pointer"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-800 mb-1">Trend Analysis</h3>
        <p className="text-blue-600">{predictionData.summary}</p>
      </div>
    </div>
  );
}

export default TrendGraph;

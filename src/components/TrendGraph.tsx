
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PredictionResult } from '@/types';

interface TrendGraphProps {
  predictionData: PredictionResult;
}

const TrendGraph: React.FC<TrendGraphProps> = ({ predictionData }) => {
  const { years, values } = predictionData;
  
  // Determine the cutoff point between historical and predicted data
  const currentYear = new Date().getFullYear();
  const historicalEndIndex = years.findIndex(year => year >= currentYear);
  
  // Prepare data for chart
  const chartData = years.map((year, i) => ({
    year,
    value: values[i],
    type: year >= currentYear ? 'predicted' : 'historical'
  }));
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historical & Predicted Trends</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Historical"
              activeDot={{ r: 8 }}
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Predicted"
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
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
};

export default TrendGraph;

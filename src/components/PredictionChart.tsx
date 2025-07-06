
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface PredictionData {
  year: number;
  historical?: number;
  predicted: number;
  confidence_low: number;
  confidence_high: number;
  is_prediction: boolean;
}

interface PredictionChartProps {
  data: PredictionData[];
  indicatorName: string;
  currentValue: number;
  prediction: {
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    factors: string[];
  };
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  data,
  indicatorName,
  currentValue,
  prediction
}) => {
  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Predictive Analysis</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`font-medium ${getTrendColor()}`}>
              {prediction.trend.charAt(0).toUpperCase() + prediction.trend.slice(1)} Trend
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Confidence: {(prediction.confidence * 100).toFixed(0)}%
          </Badge>
          <Badge variant="secondary">
            Current: {currentValue.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            historical: {
              label: "Historical",
              color: "#8884d8"
            },
            predicted: {
              label: "Predicted",
              color: "#82ca9d"
            },
            confidence: {
              label: "Confidence Range",
              color: "#ffc658"
            }
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              
              {/* Reference line for current year */}
              <ReferenceLine 
                x={currentYear} 
                stroke="#666" 
                strokeDasharray="2 2"
                label={{ value: "Now", position: "top" }}
              />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey="historical"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              
              {/* Predicted data line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
              />
              
              {/* Confidence interval - upper bound */}
              <Line
                type="monotone"
                dataKey="confidence_high"
                stroke="#ffc658"
                strokeWidth={1}
                strokeOpacity={0.5}
                dot={false}
              />
              
              {/* Confidence interval - lower bound */}
              <Line
                type="monotone"
                dataKey="confidence_low"
                stroke="#ffc658"
                strokeWidth={1}
                strokeOpacity={0.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Key Influencing Factors:</h4>
          <div className="flex flex-wrap gap-2">
            {prediction.factors.map((factor, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionChart;
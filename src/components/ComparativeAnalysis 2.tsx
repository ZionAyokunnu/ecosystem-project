
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonData {
  location: string;
  current_value: number;
  benchmark: number;
  difference: number;
  rank: number;
}

interface ComparativeAnalysisProps {
  data: ComparisonData[];
  indicatorName: string;
  selectedLocation?: string;
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  data,
  indicatorName,
  selectedLocation
}) => {
  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (diff < 0) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-600" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparative Analysis - {indicatorName}</CardTitle>
        <p className="text-sm text-gray-600">
          Compare performance across different locations and benchmarks
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            current_value: {
              label: "Current Value",
              color: "#8884d8"
            },
            benchmark: {
              label: "Benchmark",
              color: "#82ca9d"
            }
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="location" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="current_value" fill="#8884d8" name="Current Value" />
              <Bar dataKey="benchmark" fill="#82ca9d" name="Benchmark" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6">
          <h4 className="font-semibold mb-4">Performance Rankings</h4>
          <div className="space-y-3">
            {data
              .sort((a, b) => a.rank - b.rank)
              .map((item, index) => (
                <div 
                  key={item.location}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.location === selectedLocation ? 'bg-gray-50 border-gray-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      #{item.rank}
                    </Badge>
                    <span className="font-medium">{item.location}</span>
                    {item.location === selectedLocation && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{item.current_value.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">vs {item.benchmark.toFixed(1)} benchmark</div>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${getDifferenceColor(item.difference)}`}>
                      {getDifferenceIcon(item.difference)}
                      <span className="text-sm font-medium">
                        {Math.abs(item.difference).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparativeAnalysis;
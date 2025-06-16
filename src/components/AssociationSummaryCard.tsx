
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AssociationData {
  direction: string;
  count: number;
  percentage: number;
}

interface AssociationSummaryCardProps {
  indicatorName: string;
  relatedIndicatorName: string;
  data: AssociationData[];
  averageStrength: number;
  totalResponses: number;
}

const AssociationSummaryCard: React.FC<AssociationSummaryCardProps> = ({
  indicatorName,
  relatedIndicatorName,
  data,
  averageStrength,
  totalResponses
}) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  const pieData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {indicatorName} ↔ {relatedIndicatorName}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {totalResponses} responses
          </Badge>
          <Badge variant="outline">
            Avg strength: {averageStrength.toFixed(1)}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Relationship Direction</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ direction, percentage }) => `${direction}: ${percentage}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Response Distribution</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="direction" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Most Common:</span>
            <div className="text-gray-600">
              {data.length > 0 ? data.reduce((a, b) => a.count > b.count ? a : b).direction : 'N/A'}
            </div>
          </div>
          <div>
            <span className="font-medium">Consensus:</span>
            <div className="text-gray-600">
              {data.length > 0 && data[0].percentage > 60 ? 'Strong' : 'Mixed'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssociationSummaryCard;

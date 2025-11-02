
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface AIInsight {
  type: 'recommendation' | 'prediction' | 'correlation' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe?: string;
  actions?: string[];
}

interface AIInsightsPanelProps {
  insights: AIInsight[];
  indicatorName: string;
  onImplementAction?: (action: string) => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  indicatorName,
  onImplementAction
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'correlation':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recommendation':
        return 'bg-yellow-100 text-yellow-800';
      case 'prediction':
        return 'bg-blue-100 text-blue-800';
      case 'correlation':
        return 'bg-purple-100 text-purple-800';
      case 'anomaly':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <CardTitle>AI-Powered Insights</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Advanced analytics and recommendations for {indicatorName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getInsightIcon(insight.type)}
                <div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getTypeColor(insight.type)}>
                      {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getImpactColor(insight.impact)}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </Badge>
                    <Badge variant="outline">
                      {(insight.confidence * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                </div>
              </div>
              {insight.timeframe && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {insight.timeframe}
                </div>
              )}
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {insight.description}
            </p>
            
            {insight.actions && insight.actions.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Recommended Actions:
                </h5>
                <div className="space-y-2">
                  {insight.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{action}</span>
                      {onImplementAction && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onImplementAction(action)}
                          className="text-xs"
                        >
                          Implement
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No AI insights available yet.</p>
            <p className="text-sm">Check back later for analysis results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;

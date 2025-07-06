import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle } from 'lucide-react';
import { generateSuggestedInitiative, SuggestedInitiative } from '@/services/aiServices';

interface SuggestedInitiativeBoxProps {
  storyText: string;
  indicatorName: string;
  locationName: string;
}

const SuggestedInitiativeBox: React.FC<SuggestedInitiativeBoxProps> = ({
  storyText,
  indicatorName,
  locationName
}) => {
  const [initiative, setInitiative] = useState<SuggestedInitiative | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateInitiative = async () => {
      setLoading(true);
      try {
        const suggestion = await generateSuggestedInitiative(storyText, indicatorName, locationName);
        setInitiative(suggestion);
      } catch (error) {
        console.error('Failed to generate initiative:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInitiative();
  }, [storyText, indicatorName, locationName]);

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-blue-700">Generating initiative...</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-3 bg-blue-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!initiative) return null;

  const impactColors = {
    Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Medium: 'bg-orange-100 text-orange-800 border-orange-200',
    High: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Suggested Initiative</CardTitle>
          </div>
          <Badge className={`${impactColors[initiative.estimatedImpact]} text-xs`}>
            {initiative.estimatedImpact} Impact
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">{initiative.title}</h4>
          <p className="text-sm text-blue-700">{initiative.description}</p>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-blue-800 mb-2">Action Steps:</h5>
          <ul className="space-y-1">
            {initiative.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedInitiativeBox;
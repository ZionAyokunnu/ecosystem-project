
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target } from 'lucide-react';

interface SurveyCardProps {
  title: string;
  description: string;
  estimatedTime: string;
  participantCount: number;
  category: string;
  onStart: () => void;
  isCompleted?: boolean;
}

const SurveyCard: React.FC<SurveyCardProps> = ({
  title,
  description,
  estimatedTime,
  participantCount,
  category,
  onStart,
  isCompleted = false
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <Badge variant="secondary" className="mb-2">{category}</Badge>
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Completed
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{participantCount} participants</span>
          </div>
        </div>
        <Button 
          onClick={onStart} 
          className="w-full"
          disabled={isCompleted}
        >
          <Target className="w-4 h-4 mr-2" />
          {isCompleted ? 'Survey Completed' : 'Start Survey'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SurveyCard;
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, TrendingUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getUserPoints } from '@/services/gamificationApi';

interface PointsTrackerProps {
  userId?: string;
}

const PointsTracker: React.FC<PointsTrackerProps> = ({ userId: propUserId }) => {
  const { userProfile } = useUser();
  const [points, setPoints] = useState({ total_points: 0, recent_activities: [] });
  const [loading, setLoading] = useState(true);

  const userId = userProfile?.name || userProfile?.id;

  useEffect(() => {
    const fetchPoints = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const pointsData = await getUserPoints(userId);
        setPoints(pointsData);
      } catch (error) {
        console.error('Error fetching points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [userId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Your Points</p>
            <p className="text-2xl font-bold text-gray-600">{points.total_points}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-gray-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>
        {points.recent_activities.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Latest: +{points.recent_activities[0].points_awarded} pts from{' '}
              {points.recent_activities[0].action_type.replace(/_/g, ' ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsTracker;

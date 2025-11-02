
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  total_points: number;
  survey_count: number;
  badge_count: number;
  location_id?: string;
}

const Leaderboard: React.FC = () => {
  const { profile } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, [profile]);

  const fetchLeaderboards = async () => {
    if (!profile) return;

    // Fetch global leaderboard
    const { data: globalData } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        location_id
      `);

    if (globalData) {
      const leaderboardPromises = globalData.map(async (user) => {
        const { data: pointsData } = await supabase
          .from('user_points_log')
          .select('points_awarded')
          .eq('user_id', user.id);

        const { data: badgesData } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', user.id);

        const { data: surveyData } = await supabase
          .from('relationship_user_responses')
          .select('response_id')
          .eq('user_id', user.id);

        return {
          user_id: user.id,
          first_name: user.first_name,
          location_id: user.location_id,
          total_points: pointsData?.reduce((sum, p) => sum + p.points_awarded, 0) || 0,
          badge_count: badgesData?.length || 0,
          survey_count: surveyData?.length || 0
        };
      });

      const leaderboardData = await Promise.all(leaderboardPromises);
      const sortedGlobal = leaderboardData.sort((a, b) => b.total_points - a.total_points);
      setGlobalLeaderboard(sortedGlobal);

      // Filter for local leaderboard
      const localData = sortedGlobal.filter(entry => entry.location_id === profile.location_id);
      setLocalLeaderboard(localData);
    }

    setLoading(false);
  };

  const renderLeaderboard = (data: LeaderboardEntry[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No data available</p>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 10).map((entry, index) => (
              <div key={entry.user_id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Award className="w-6 h-6 text-orange-500" />}
                    {index > 2 && <span className="w-6 text-center font-bold">{index + 1}</span>}
                  </div>
                  <div>
                    <p className="font-medium">{entry.first_name}</p>
                    <p className="text-sm text-gray-600">
                      {entry.survey_count} surveys • {entry.badge_count} badges
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.total_points}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Leaderboard</h1>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="local">Local Community</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          {renderLeaderboard(globalLeaderboard, "Global Leaderboard")}
        </TabsContent>

        <TabsContent value="local">
          {renderLeaderboard(localLeaderboard, "Local Community Leaderboard")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;

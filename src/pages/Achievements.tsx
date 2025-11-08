import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock } from 'lucide-react';
import { achievementService } from '@/services/achievementService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Achievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAchievements: 0,
    earnedAchievements: 0
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userAchievements = await achievementService.getUserAchievements(user.id);
      setAchievements(userAchievements);
      
      const earned = userAchievements.filter(a => a.earned).length;
      setStats({
        totalAchievements: userAchievements.length,
        earnedAchievements: earned
      });
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (stats.earnedAchievements / stats.totalAchievements) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">Track your learning journey</p>
          </div>
          <Button onClick={() => navigate('/path')} variant="outline">
            Back to Path
          </Button>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {stats.earnedAchievements} of {stats.totalAchievements} Achievements
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Achievement Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all duration-200 ${
                achievement.earned
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`text-4xl ${
                      achievement.earned ? 'animate-bounce' : 'grayscale'
                    }`}
                  >
                    {achievement.earned ? achievement.icon : <Lock className="w-10 h-10" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.earnedAt && (
                      <p className="text-xs text-muted-foreground">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!achievement.earned && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Lock className="w-3 h-3" />
                        <span>Keep learning to unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, TrendingUp, Users } from 'lucide-react';
import { generatePersonalizedInsights } from '@/services/insightsService';
import { SimpleProgressRing } from '@/components/charts/SimpleProgressRing';
import { SimpleTrendChart } from '@/components/charts/SimpleTrendChart';

interface PersonalizedInsightsProps {
  indicatorId?: string;
}

const PersonalizedInsights: React.FC<PersonalizedInsightsProps> = ({ indicatorId }) => {
  const { indicatorId: paramIndicatorId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [indicator, setIndicator] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);

  const targetIndicatorId = indicatorId || paramIndicatorId;

  useEffect(() => {
    loadInsightsData();
  }, [targetIndicatorId, user]);

  const loadInsightsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let finalIndicatorId = targetIndicatorId;

      if (!finalIndicatorId) {
        const { data: pathState } = await supabase
          .from('user_path_state')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const { data: recentIndicator } = await supabase
          .from('user_indicator_history')
          .select('indicator_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        finalIndicatorId = recentIndicator?.[0]?.indicator_id;
      }

      if (!finalIndicatorId) {
        finalIndicatorId = 'wellbeing_overall';
      }

      const { data: indicatorData } = await supabase
        .from('indicators')
        .select('*')
        .eq('indicator_id', finalIndicatorId)
        .single();

      setIndicator(indicatorData);

      const personalizedData = await generatePersonalizedInsights(
        user.id,
        finalIndicatorId,
        profile
      );

      setInsights(personalizedData.insights);
      setRecommendations(personalizedData.recommendations);
      setUserProgress(personalizedData.progress);

    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🧠</div>
          <div className="text-xl font-medium text-gray-700">
            Preparing your personal insights...
          </div>
        </div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <div className="text-xl font-medium text-gray-700 mb-4">
            No insights available yet
          </div>
          <Button onClick={() => navigate('/path')}>
            Start Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 pb-8">
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/path')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Your Insights</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="text-6xl">🎯</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Amazing work on {indicator.name}!
              </h1>
              <p className="text-xl text-white/90 mb-4">
                You've been exploring how this affects your community
              </p>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="font-bold">Day {userProgress?.currentDay || 1}</span>
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="font-bold">{userProgress?.completedSurveys || 0} insights shared</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{insights?.progressPercentage || 0}%</div>
              <div className="text-white/80">Understanding</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-8 shadow-md">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-3xl">💡</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                What does this mean for you?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {insights?.personalExplanation || 
                `${indicator.name} is about how well things are working in your community. 
                When this is strong, people feel happy, safe, and connected to each other.`}
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-800">Current Level</div>
              <div className="text-xl font-bold text-green-600">
                {insights?.currentScore || 'Good'}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-800">Trend</div>
              <div className="text-xl font-bold text-blue-600">
                {insights?.trendDirection || 'Improving'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-gray-800">Your Impact</div>
              <div className="text-xl font-bold text-purple-600">
                +{insights?.contributionPoints || 5} insights
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              Try These in Your Community
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Based on what you've learned about {indicator.name}, here are some things you can do:
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
              >
                <div className="text-4xl mb-4">{rec.emoji}</div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {rec.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {rec.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⏱️ {rec.timeEstimate}</span>
                    <span>📍 {rec.difficulty}/5</span>
                  </div>
                  <div className="text-xs font-semibold text-green-600">
                    +{rec.impactPoints} impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">
                See How Things Are Changing
              </h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-4">
                Community {indicator.name}
              </div>
              <SimpleProgressRing 
                value={insights?.communityScore || 75} 
                size={120}
                strokeWidth={8}
                color="#10B981"
              />
              <div className="text-sm text-gray-500 mt-2">
                vs last year: {insights?.yearOverYearChange || '+5%'}
              </div>
            </div>

            <div>
              <div className="text-lg font-medium text-gray-700 mb-4">
                Recent Changes
              </div>
              <SimpleTrendChart 
                data={insights?.trendData || []} 
                height={120}
                color="#3B82F6"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-800">
              You vs Your Neighbors
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium text-gray-600">Your Rank</div>
              <div className="text-xl font-bold text-yellow-600">
                #{insights?.communityRank || 1} in area
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-600">Your Score</div>
              <div className="text-xl font-bold text-green-600">
                {insights?.personalScore || 85}/100
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-gray-600">Area Average</div>
              <div className="text-xl font-bold text-blue-600">
                {insights?.areaAverage || 78}/100
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/path')} 
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Continue Your Learning Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedInsights;

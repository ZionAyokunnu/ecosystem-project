import { supabase } from '@/integrations/supabase/client';
import { queryLocalLLM } from './localLLM';

export interface PersonalizedInsightData {
  insights: {
    personalExplanation: string;
    currentScore: string;
    trendDirection: string;
    contributionPoints: number;
    progressPercentage: number;
    communityScore: number;
    yearOverYearChange: string;
    communityRank: number;
    personalScore: number;
    areaAverage: number;
    trendData: any[];
  };
  recommendations: Array<{
    title: string;
    description: string;
    emoji: string;
    timeEstimate: string;
    difficulty: number;
    impactPoints: number;
  }>;
  progress: {
    currentDay: number;
    completedSurveys: number;
  };
}

export const generatePersonalizedInsights = async (
  userId: string, 
  indicatorId: string, 
  userProfile: any
): Promise<PersonalizedInsightData> => {
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, last_session, preferred_domains')
    .eq('id', userId)
    .single();

  const { count: completedCount } = await supabase
    .from('user_node_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  const pathState = profile ? {
    current_day: (completedCount || 0) + 1
  } : null;

  const { data: indicator } = await supabase
    .from('indicators')
    .select('*')
    .eq('id', indicatorId)
    .single();

  const { data: userResponses } = await supabase
    .from('relationship_user_responses')
    .select('*')
    .eq('user_id', userId)
    .or(`parent_id.eq.${indicatorId},child_id.eq.${indicatorId}`);

  const { data: communityData } = await supabase
    .from('indicator_values')
    .select('*')
    .eq('indicator_id', indicatorId)
    .eq('location_id', userProfile?.location_id)
    .order('year', { ascending: false })
    .limit(5);

  const aiPrompt = `
    User Profile: ${userProfile?.age} year old ${userProfile?.family_status} interested in ${userProfile?.interests?.join(', ')}
    Indicator: ${indicator?.name} - ${indicator?.description}
    User Responses: ${userResponses?.length || 0} survey responses
    Location: ${userProfile?.location_id}
    
    Create a simple, encouraging explanation for this person about what ${indicator?.name} means in their community.
    Use language suitable for ages 11-80. Be specific to their demographic and interests.
    Keep it under 100 words and focus on why this matters to them personally.
  `;

  let personalExplanation = `${indicator?.name} affects how connected and supported people feel in your community. When it's strong, neighbors help each other and everyone feels they belong.`;
  
  try {
    personalExplanation = await queryLocalLLM(aiPrompt, 'community');
  } catch (error) {
    console.error('Error generating AI explanation:', error);
  }

  const recommendations = await generateActionRecommendations(
    userId, 
    indicatorId, 
    userProfile
  );

  const insights = {
    personalExplanation,
    currentScore: calculateUserScore(communityData),
    trendDirection: calculateTrend(communityData),
    contributionPoints: userResponses?.length * 2 || 5,
    progressPercentage: Math.min(Math.round((userResponses?.length || 0) * 20), 100),
    communityScore: communityData?.[0]?.value || 75,
    yearOverYearChange: calculateYearChange(communityData),
    communityRank: Math.floor(Math.random() * 10) + 1,
    personalScore: Math.min(85 + (userResponses?.length || 0) * 3, 100),
    areaAverage: communityData?.[0]?.value || 78,
    trendData: formatTrendData(communityData)
  };

  return {
    insights,
    recommendations,
    progress: {
      currentDay: pathState?.current_day || 1,
      completedSurveys: userResponses?.length || 0
    }
  };
};

const generateActionRecommendations = async (
  userId: string, 
  indicatorId: string, 
  userProfile: any
) => {
  const interests = userProfile?.interests || [];
  const timeAvail = userProfile?.time_availability || 'flexible';
  const mobility = userProfile?.mobility_level || 'high';
  const family = userProfile?.family_status || 'single';
  const age = userProfile?.age || 25;

  const templates = {
    'wellbeing_overall': [
      {
        title: 'Visit a Local Community Space',
        description: 'Explore how community spaces contribute to neighborhood wellbeing',
        emoji: '🏛️',
        timeEstimate: '30 min',
        difficulty: 1,
        impactPoints: 3
      },
      {
        title: 'Attend a Community Event',
        description: 'Join neighbors at local gatherings to strengthen social connections',
        emoji: '🤝',
        timeEstimate: '2 hours',
        difficulty: 2,
        impactPoints: 5
      },
      {
        title: 'Check Local Health Services',
        description: 'Learn about healthcare and wellness options in your area',
        emoji: '🏥',
        timeEstimate: '1 hour',
        difficulty: 1,
        impactPoints: 4
      }
    ]
  };

  let baseRecommendations = templates[indicatorId as keyof typeof templates] || templates.wellbeing_overall;

  return baseRecommendations.map(rec => ({
    ...rec,
    description: personalizeDescription(rec.description, userProfile),
    timeEstimate: adjustTimeEstimate(rec.timeEstimate, timeAvail),
    difficulty: adjustDifficulty(rec.difficulty, mobility, age)
  }));
};

const personalizeDescription = (description: string, profile: any): string => {
  const interests = profile?.interests || [];
  const family = profile?.family_status || '';
  
  if (family === 'family_with_kids' && description.includes('community')) {
    return description + ' - great for families with children!';
  }
  if (interests.includes('health') && description.includes('health')) {
    return description + ' Perfect for your health interests!';
  }
  return description;
};

const adjustTimeEstimate = (baseTime: string, availability: string): string => {
  if (availability === 'limited' && baseTime.includes('2 hours')) {
    return '1 hour';
  }
  return baseTime;
};

const adjustDifficulty = (baseDifficulty: number, mobility: string, age: number): number => {
  let adjusted = baseDifficulty;
  if (mobility === 'low') adjusted = Math.max(1, adjusted - 1);
  if (age > 70) adjusted = Math.max(1, adjusted - 1);
  if (age < 16) adjusted = Math.max(1, adjusted - 1);
  return adjusted;
};

const calculateUserScore = (communityData: any[]): string => {
  if (!communityData || communityData.length === 0) return 'Good';
  const latest = communityData[0]?.value || 75;
  if (latest >= 80) return 'Excellent';
  if (latest >= 60) return 'Good';
  return 'Improving';
};

const calculateTrend = (communityData: any[]): string => {
  if (!communityData || communityData.length < 2) return 'Stable';
  const latest = communityData[0]?.value || 0;
  const previous = communityData[1]?.value || 0;
  if (latest > previous) return 'Improving';
  if (latest < previous) return 'Declining';
  return 'Stable';
};

const calculateYearChange = (communityData: any[]): string => {
  if (!communityData || communityData.length < 2) return '+0%';
  const latest = communityData[0]?.value || 0;
  const previous = communityData[1]?.value || 0;
  const change = ((latest - previous) / previous * 100);
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const formatTrendData = (communityData: any[]): any[] => {
  return communityData?.slice(0, 5).reverse().map(item => ({
    year: item.year,
    value: item.value
  })) || [];
};

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Users, TrendingUp } from 'lucide-react';
import { pathProgressService } from '@/services/pathProgressService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '@/context/LocationContext';
import SurveyCard from '@/components/SurveyCard';
import SurveyModal from '@/components/SurveyModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Survey } from '@/types';
import { useAuth } from '@/hooks/useAuth';


const SurveysPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unit');
  
  const { selectedLocation } = useLocation();
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());
  const [unitCompleting, setUnitCompleting] = useState(false);
  const { profile } = useAuth();

  // // Mock survey data
  // const surveys = [
  //   {
  //     id: 'community-wellbeing',
  //     title: 'Community Wellbeing Assessment',
  //     description: 'Help us understand the factors that impact wellbeing in your community.',
  //     estimatedTime: '5-7 minutes',
  //     participantCount: 284,
  //     category: 'Health & Wellbeing',
  //     questions: [
  //       {
  //         id: 'q1',
  //         question: 'How would you rate the overall wellbeing in your community?',
  //         type: 'rating' as const,
  //         required: true
  //       },
  //       {
  //         id: 'q2',
  //         question: 'What factors most impact community wellbeing?',
  //         type: 'multiple-choice' as const,
  //         options: ['Healthcare access', 'Employment opportunities', 'Housing quality', 'Social connections', 'Environmental factors'],
  //         required: true
  //       },
  //       {
  //         id: 'q3',
  //         question: 'What improvements would you most like to see?',
  //         type: 'text' as const,
  //         required: false
  //       }
  //     ]
  //   },
  //   {
  //     id: 'economic-opportunities',
  //     title: 'Economic Opportunities Survey',
  //     description: 'Share your views on local economic development and job opportunities.',
  //     estimatedTime: '4-6 minutes',
  //     participantCount: 156,
  //     category: 'Economy & Employment',
  //     questions: [
  //       {
  //         id: 'q1',
  //         question: 'How satisfied are you with local job opportunities?',
  //         type: 'rating' as const,
  //         required: true
  //       },
  //       {
  //         id: 'q2',
  //         question: 'What type of businesses would you like to see more of?',
  //         type: 'text' as const,
  //         required: false
  //       }
  //     ]
  //   },
  //   {
  //     id: 'housing-transport',
  //     title: 'Housing & Transport Assessment',
  //     description: 'Help us understand housing affordability and transport needs in your area.',
  //     estimatedTime: '6-8 minutes',
  //     participantCount: 203,
  //     category: 'Infrastructure',
  //     questions: [
  //       {
  //         id: 'q1',
  //         question: 'How would you rate housing affordability in your area?',
  //         type: 'rating' as const,
  //         required: true
  //       },
  //       {
  //         id: 'q2',
  //         question: 'What transport improvements are most needed?',
  //         type: 'multiple-choice' as const,
  //         options: ['Better bus services', 'More cycling paths', 'Improved roads', 'Better parking', 'Rail connections'],
  //         required: true
  //       }
  //     ]
  //   }
  // ];
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [questionCounts, setQuestionCounts]       = useState<Record<string,number>>({});
  const [participantCounts, setParticipantCounts] = useState<Record<string,number>>({});

  useEffect(() => {
    // Update daily stats when entering surveys
    pathProgressService.updateDailyStats();
    
    const locId = selectedLocation?.location_id || profile?.location_id;
    if (!locId) {
      console.warn('SurveysPage: no location to fetch for');
      return;
    }
    console.log('📊 Fetching surveys for location:', locId);


    (async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active')
        .eq('target_location', locId);

      if (error) {
        console.error('Error fetching surveys:', error);
        toast.error('Failed to load surveys');
      } else {
        setSurveys(data.map(survey => ({
          ...survey,
          demographic_filters: survey.demographic_filters as { genders: string[]; age_groups: string[]; }
        })) as Survey[]);
      }
    })();
  }, [selectedLocation, profile]);

  useEffect(() => {
    if (surveys.length === 0) return;

    (async () => {
      const qc: Record<string,number> = {};
      const pc: Record<string,number> = {};
      for (const s of surveys) {
        // 1) count how many questions this survey has
        const { count: qCount } = await supabase
          .from('survey_questions')
          .select('*', { head: true, count: 'exact' })
          .eq('survey_id', s.survey_id);
        qc[s.survey_id] = qCount || 0;

        // 2) count how many responses have been recorded
        const { count: rCount } = await supabase
          .from('survey_responses')
          .select('*', { head: true, count: 'exact' })
          .eq('survey_id', s.survey_id);
        // assume each participant answers every question
        pc[s.survey_id] = qc[s.survey_id]
          ? Math.floor((rCount || 0) / qc[s.survey_id])
          : 0;
      }
      setQuestionCounts(qc);
      setParticipantCounts(pc);
    })();
  }, [surveys]);

  const handleStartSurvey = (survey: any) => {
    setSelectedSurvey(survey);
  };

  const handleSurveyComplete = (responses: Record<string, string>) => {
    console.log('Survey responses:', responses);
    setCompletedSurveys(prev => new Set([...prev, selectedSurvey.survey_id]));
    toast.success('Thank you for completing the survey! +2 Insights');
    setSelectedSurvey(null);
  };

  const handleCompleteUnit = async () => {
    if (!unitId) return;
    
    setUnitCompleting(true);
    const insightsEarned = completedSurveys.size * 2; // 2 insights per survey
    const result = await pathProgressService.completeUnit(unitId, insightsEarned);
    
    if (result.success) {
      // Navigate back to path after a short delay
      setTimeout(() => {
        navigate('/path');
      }, 2000);
    }
    setUnitCompleting(false);
  };

  // Check if all surveys in the unit are completed
  const allSurveysCompleted = surveys.length > 0 && surveys.every(s => 
    completedSurveys.has(s.survey_id)
  );

  const availableSurveys = surveys.filter(survey => !completedSurveys.has(survey.survey_id));
  const completedSurveysList = surveys.filter(survey => completedSurveys.has(survey.survey_id));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Unit Progress Banner */}
      {unitId && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/path')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Path
          </Button>
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-primary mb-2">
                {unitId.replace('_', ' ').toUpperCase()}
              </h2>
              <p className="text-muted-foreground mb-4">
                Complete all surveys to finish this unit and unlock the next one!
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Progress: {completedSurveys.size} / {surveys.length} completed
                </div>
                {allSurveysCompleted && (
                  <Button
                    onClick={handleCompleteUnit}
                    disabled={unitCompleting}
                    className="bg-success hover:bg-success-hover text-white font-bold"
                  >
                    {unitCompleting ? '🎉 Completing...' : '✅ Complete Unit'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        {!unitId && (
          <Button variant="ghost" onClick={() => navigate('/overview')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {unitId ? 'Unit Surveys' : 'Community Surveys'}
          </h1>
          <p className="text-gray-600 mt-1">
            Share your voice and help shape community priorities
            {selectedLocation && ` in ${selectedLocation.name}`}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Surveys</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSurveys.length}</div>
            <p className="text-xs text-muted-foreground">Ready to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Contributions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSurveys.size}</div>
            <p className="text-xs text-muted-foreground">Surveys completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
             {surveys.reduce(
              (acc, survey) => acc + (participantCounts[survey.survey_id] || 0),
               0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Surveys */}
      {availableSurveys.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Surveys</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSurveys.map(survey => (
              <SurveyCard
                key={survey.survey_id}
                title={survey.title}
                description={survey.description}
                estimatedTime={`${questionCounts[survey.survey_id] ?? 0} min`}
                participantCount={participantCounts[survey.survey_id] ?? 0}
                category={survey.category}
                onStart={() => handleStartSurvey(survey)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Surveys */}
      {completedSurveysList.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Surveys</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedSurveysList.map(survey => (
              <SurveyCard
                key={String(survey.id)}
                title={survey.title}
                description={survey.description}
                estimatedTime={survey.estimatedTime}
                participantCount={survey.participantCount}
                category={survey.category}
                onStart={() => {}}
                isCompleted={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No surveys available */}
      {availableSurveys.length === 0 && completedSurveysList.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Surveys Available</h3>
            <p className="text-gray-500">
              Check back soon for new community surveys to participate in.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Survey Modal */}
      {selectedSurvey && (
        <SurveyModal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          title={selectedSurvey.title}
          questions={selectedSurvey.questions}
          onComplete={handleSurveyComplete}
        />
      )}
    </div>
  );
};

export default SurveysPage;
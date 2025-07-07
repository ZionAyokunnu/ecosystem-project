
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from '@/context/LocationContext';
import SurveyCard from '@/components/SurveyCard';
import SurveyModal from '@/components/SurveyModal';
import { toast } from 'sonner';

const SurveysPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation } = useLocation();
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());

  // Mock survey data
  const surveys = [
    {
      id: 'community-wellbeing',
      title: 'Community Wellbeing Assessment',
      description: 'Help us understand the factors that impact wellbeing in your community.',
      estimatedTime: '5-7 minutes',
      participantCount: 284,
      category: 'Health & Wellbeing',
      questions: [
        {
          id: 'q1',
          question: 'How would you rate the overall wellbeing in your community?',
          type: 'rating' as const,
          required: true
        },
        {
          id: 'q2',
          question: 'What factors most impact community wellbeing?',
          type: 'multiple-choice' as const,
          options: ['Healthcare access', 'Employment opportunities', 'Housing quality', 'Social connections', 'Environmental factors'],
          required: true
        },
        {
          id: 'q3',
          question: 'What improvements would you most like to see?',
          type: 'text' as const,
          required: false
        }
      ]
    },
    {
      id: 'economic-opportunities',
      title: 'Economic Opportunities Survey',
      description: 'Share your views on local economic development and job opportunities.',
      estimatedTime: '4-6 minutes',
      participantCount: 156,
      category: 'Economy & Employment',
      questions: [
        {
          id: 'q1',
          question: 'How satisfied are you with local job opportunities?',
          type: 'rating' as const,
          required: true
        },
        {
          id: 'q2',
          question: 'What type of businesses would you like to see more of?',
          type: 'text' as const,
          required: false
        }
      ]
    },
    {
      id: 'housing-transport',
      title: 'Housing & Transport Assessment',
      description: 'Help us understand housing affordability and transport needs in your area.',
      estimatedTime: '6-8 minutes',
      participantCount: 203,
      category: 'Infrastructure',
      questions: [
        {
          id: 'q1',
          question: 'How would you rate housing affordability in your area?',
          type: 'rating' as const,
          required: true
        },
        {
          id: 'q2',
          question: 'What transport improvements are most needed?',
          type: 'multiple-choice' as const,
          options: ['Better bus services', 'More cycling paths', 'Improved roads', 'Better parking', 'Rail connections'],
          required: true
        }
      ]
    }
  ];

  const handleStartSurvey = (survey: any) => {
    setSelectedSurvey(survey);
  };

  const handleSurveyComplete = (responses: Record<string, string>) => {
    console.log('Survey responses:', responses);
    setCompletedSurveys(prev => new Set([...prev, selectedSurvey.id]));
    toast.success('Thank you for completing the survey!');
    setSelectedSurvey(null);
  };

  const availableSurveys = surveys.filter(survey => !completedSurveys.has(survey.id));
  const completedSurveysList = surveys.filter(survey => completedSurveys.has(survey.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/overview')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Community Surveys</h1>
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
              {surveys.reduce((acc, survey) => acc + survey.participantCount, 0)}
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
                key={survey.id}
                title={survey.title}
                description={survey.description}
                estimatedTime={survey.estimatedTime}
                participantCount={survey.participantCount}
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
                key={survey.id}
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
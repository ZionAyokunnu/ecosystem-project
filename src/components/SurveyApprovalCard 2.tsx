import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, Users, Phone, Globe, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SurveyApprovalCardProps {
  survey: any;
  onApprove: (surveyId: string) => void;
  onDecline: (surveyId: string, reason: string) => void;
  questionCount: number;
  estimatedTime: number;
  targetUsers: number;
}

const SurveyApprovalCard: React.FC<SurveyApprovalCardProps> = ({
  survey,
  onApprove,
  onDecline,
  questionCount,
  estimatedTime,
  targetUsers,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    // Fetch current participant count
    const fetchParticipantCount = async () => {
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', survey.survey_id);
      
      setParticipantCount(Math.floor((count || 0) / questionCount) || 0);
    };

    fetchParticipantCount();
  }, [survey.survey_id, questionCount]);

  const handleDecline = () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    onDecline(survey.survey_id, declineReason);
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  const demographicFilters = survey.demographic_filters || { genders: [], age_groups: [] };
  const targetGenders = demographicFilters.genders || [];
  const targetAgeGroups = demographicFilters.age_groups || [];

  return (
    <Card className="border-l-4 border-l-yellow-400">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{survey.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{survey.domain}</Badge>
              {survey.is_voice_enabled && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Voice Enabled
                </Badge>
              )}
              {survey.is_compulsory && (
                <Badge variant="default">Compulsory</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(survey.survey_id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeclineModal(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Survey Description */}
          {survey.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
            </div>
          )}

          {/* Justification */}
          {survey.justification && (
            <div>
              <Label className="text-sm font-medium">Justification</Label>
              <p className="text-sm text-gray-600 mt-1">{survey.justification}</p>
            </div>
          )}

          {/* Survey Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium">~{estimatedTime} min</div>
                <div className="text-gray-500">{questionCount} questions</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium">{targetUsers} eligible</div>
                <div className="text-gray-500">Target users</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {survey.is_voice_enabled ? (
                <Phone className="w-4 h-4 text-gray-500" />
              ) : (
                <Globe className="w-4 h-4 text-gray-500" />
              )}
              <div className="text-sm">
                <div className="font-medium">
                  {survey.is_voice_enabled ? 'Voice + Web' : 'Web Only'}
                </div>
                <div className="text-gray-500">Collection method</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <div className="text-sm">
                <div className="font-medium">{participantCount}</div>
                <div className="text-gray-500">Completed</div>
              </div>
            </div>
          </div>

          {/* Demographics Targeting */}
          {(targetGenders.length > 0 || targetAgeGroups.length > 0) && (
            <div>
              <Label className="text-sm font-medium">Demographic Targeting</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {targetGenders.map(gender => (
                  <Badge key={gender} variant="outline">{gender}</Badge>
                ))}
                {targetAgeGroups.map(ageGroup => (
                  <Badge key={ageGroup} variant="outline">{ageGroup}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Decline Survey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="decline-reason">Reason for declining</Label>
                  <Textarea
                    id="decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Please explain why you're declining this survey..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDecline}
                  >
                    Decline Survey
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveyApprovalCard;
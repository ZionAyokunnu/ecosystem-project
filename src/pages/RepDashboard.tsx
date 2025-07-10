import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Flag, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Survey } from '@/types';

interface TownStats {
  total_residents: number;
  completed_onboarding: number;
  pending_flags: number;
}

interface FlaggedResponse {
  id: string;
  flag_reason: string;
  response_id: string;
  user_id: { first_name: string } | null;
  created_at: string;
}

const RepDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [pendingSurveys, setPendingSurveys] = useState<Survey[]>([]);
  const [locationNames, setLocationNames] = useState<Record<string, string>>({});

  const [townStats, setTownStats] = useState<TownStats | null>(null);
  const [flaggedResponses, setFlaggedResponses] = useState<FlaggedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFlags, setTotalFlags] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!profile?.location_id) return;

    (async () => {
      try {
        // 1) Load the pending surveys for this rep’s location
        const { data: surveys, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('status', 'pending_approval')
          .eq('target_location', profile.location_id);
        if (surveyError) throw surveyError;
        const pending = surveys as Survey[];
        setPendingSurveys(pending);

        // 2) Fetch each unique location’s name
        const targetIds = Array.from(
          new Set(pending.map(s => s.target_location!).filter(Boolean))
        );
        if (targetIds.length) {
          const { data: locs, error: locError } = await supabase
            .from('locations')
            .select('location_id, name')
            .in('location_id', targetIds);
          if (locError) throw locError;
          const map: Record<string, string> = {};
          locs?.forEach(l => (map[l.location_id] = l.name));
          setLocationNames(map);
        }
      } catch (err) {
        console.error('Error fetching pending surveys:', err);
        toast.error('Failed to load pending surveys');
      }
    })();
  }, [profile]);

  useEffect(() => {
    if (profile?.location_id) {
      fetchTownStats();
      fetchFlaggedResponses(1);
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchTownStats = async () => {
    if (!profile?.location_id) return;

    try {
      console.log("📊 Fetching town stats for location:", profile.location_id);
      
      // Fetch residents count for this location
      const { data: residents, error: residentsError } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('location_id', profile.location_id);

      if (residentsError) {
        console.error("❌ Error fetching residents:", residentsError);
        throw residentsError;
      }

      // Get count of pending flags (not location-specific as flags are global)
      const { count: flagsCount, error: flagsError } = await supabase
        .from('flagged_responses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (flagsError) {
        console.error("❌ Error fetching flags count:", flagsError);
        throw flagsError;
      }

      const stats = {
        total_residents: residents?.length || 0,
        completed_onboarding: residents?.filter(r => r.has_completed_onboarding).length || 0,
        pending_flags: flagsCount || 0
      };

      console.log("✅ Town stats:", stats);
      setTownStats(stats);
      setTotalFlags(flagsCount || 0);
    } catch (error) {
      console.error("💥 Error fetching town stats:", error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedResponses = async (page: number) => {
    try {
      setFlagsLoading(true);
      console.log("🚩 Fetching flagged responses, page:", page);
      
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('flagged_responses')
        .select(`
          id,
          flag_reason,
          response_id,
          created_at,
          user_id:profiles!flagged_responses_user_id_fkey(first_name)
        `, { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error("❌ Error fetching flagged responses:", error);
        throw error;
      }

      console.log("✅ Flagged responses:", data);
      setFlaggedResponses(data || []);
      setTotalFlags(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("💥 Error fetching flagged responses:", error);
      toast.error('Failed to load flagged responses');
    } finally {
      setFlagsLoading(false);
    }
  };

  const handleFlagAction = async (flagId: string, action: 'approved' | 'rejected') => {
    try {
      console.log(`🎯 ${action} flag:`, flagId);
      
      const { error } = await supabase
        .from('flagged_responses')
        .update({ status: action, rep_id: profile?.id })
        .eq('id', flagId);

      if (error) {
        console.error(`❌ Error ${action} flag:`, error);
        throw error;
      }

      console.log(`✅ Flag ${action} successfully`);
      toast.success(`Flag ${action} successfully`);
      
      // Refresh the current page
      await fetchFlaggedResponses(currentPage);
      await fetchTownStats();
    } catch (error) {
      console.error(`💥 Error handling flag action:`, error);
      toast.error(`Failed to ${action} flag`);
    }
  };

  const totalPages = Math.ceil(totalFlags / itemsPerPage);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const handleApproveSurvey = async (surveyId: string) => {
    try {
      await supabase.from('surveys').update({ status: 'active' }).eq('survey_id', surveyId);
      toast.success('Survey approved');
      setPendingSurveys(ps => ps.filter(s => s.survey_id !== surveyId));
    } catch (err) {
      console.error('Error approving survey:', err);
      toast.error('Failed to approve survey');
    }
  };

  const handleRejectSurvey = async (surveyId: string) => {
    try {
      await supabase.from('surveys').update({ status: 'archived' }).eq('survey_id', surveyId);
      toast.success('Survey rejected');
      setPendingSurveys(ps => ps.filter(s => s.survey_id !== surveyId));
    } catch (err) {
      console.error('Error rejecting survey:', err);
      toast.error('Failed to reject survey');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Representative Dashboard</h1>

      {/* Town Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{townStats?.total_residents || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{townStats?.completed_onboarding || 0}</p>
            <p className="text-sm text-gray-600">
              {townStats?.total_residents ? 
                Math.round((townStats.completed_onboarding / townStats.total_residents) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Pending Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{townStats?.pending_flags || 0}</p>
          </CardContent>
        </Card>
      </div>

      {pendingSurveys.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Surveys for Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSurveys.map(survey => (
              <div key={survey.survey_id} className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">{survey.title}</p>
                  <p className="text-sm text-gray-500">Domain: {survey.domain}</p>
                  <p className="text-sm text-gray-500">Explanation: {survey.description}</p>
                  {/* <p className="text-sm text-gray-500">
                    Location: {locationNames[survey.target_location!] || 'Unknown'}
                  </p> */}

                  <p className="text-sm text-gray-500">
                    Location:{' '}
                    {(() => {
                      const joined = (survey as any).location;
                      if (joined) {
                        if (Array.isArray(joined)) return joined[0]?.name || 'Unknown';
                        if (typeof joined === 'object') return joined.name || 'Unknown';
                      }
                      const name = locationNames[survey.target_location!];
                      if (name) return name;
                      return survey.target_location || 'Unknown';
                    })()}
                  </p>

                </div>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => handleApproveSurvey(survey.survey_id)}>Approve</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRejectSurvey(survey.survey_id)}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Flagged Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Responses for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {flagsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="ml-2">Loading flags...</span>
            </div>
          ) : flaggedResponses.length === 0 ? (
            <p className="text-gray-600">No pending flagged responses</p>
          ) : (
            <>
              <div className="space-y-4">
                {flaggedResponses.map((flag) => (
                  <div key={flag.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Flag Reason: {flag.flag_reason}</p>
                        <p className="text-sm text-gray-600">
                          Reported by: {flag.user_id?.first_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Response ID: {flag.response_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(flag.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleFlagAction(flag.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleFlagAction(flag.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalFlags)} of {totalFlags} flags
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFlaggedResponses(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFlaggedResponses(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepDashboard;

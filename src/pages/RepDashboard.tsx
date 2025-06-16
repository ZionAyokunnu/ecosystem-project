
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Flag, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

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
  const [townStats, setTownStats] = useState<TownStats | null>(null);
  const [flaggedResponses, setFlaggedResponses] = useState<FlaggedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFlags, setTotalFlags] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (profile?.location_id) {
      fetchTownStats();
      fetchFlaggedResponses(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

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

      {/* Flagged Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Responses for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {flagsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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

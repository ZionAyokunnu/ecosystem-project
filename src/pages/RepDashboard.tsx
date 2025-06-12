
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Flag, CheckCircle } from 'lucide-react';

interface TownStats {
  total_residents: number;
  completed_onboarding: number;
  pending_flags: number;
}

const RepDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [townStats, setTownStats] = useState<TownStats | null>(null);
  const [flaggedResponses, setFlaggedResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.location_id) {
      fetchTownStats();
      fetchFlaggedResponses();
    }
  }, [profile]);

  const fetchTownStats = async () => {
    if (!profile?.location_id) return;

    const { data: residents } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('location_id', profile.location_id);

    const { data: flags } = await supabase
      .from('flagged_responses')
      .select('id')
      .eq('status', 'pending');

    if (residents) {
      setTownStats({
        total_residents: residents.length,
        completed_onboarding: residents.filter(r => r.has_completed_onboarding).length,
        pending_flags: flags?.length || 0
      });
    }
    setLoading(false);
  };

  const fetchFlaggedResponses = async () => {
    const { data } = await supabase
      .from('flagged_responses')
      .select(`
        *,
        user_id:profiles!flagged_responses_user_id_fkey(first_name),
        response_id:relationship_user_responses(*)
      `)
      .eq('status', 'pending')
      .limit(10);

    setFlaggedResponses(data || []);
  };

  const handleFlagAction = async (flagId: string, action: 'approved' | 'rejected') => {
    await supabase
      .from('flagged_responses')
      .update({ status: action, rep_id: profile?.id })
      .eq('id', flagId);

    fetchFlaggedResponses();
    fetchTownStats();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
          {flaggedResponses.length === 0 ? (
            <p className="text-gray-600">No pending flagged responses</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepDashboard;

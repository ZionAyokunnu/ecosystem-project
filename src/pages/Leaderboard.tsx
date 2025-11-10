
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PodiumView } from '@/components/leaderboard/PodiumView';

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
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'global' | 'local'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab, profile]);

  const loadLeaderboard = async () => {
    if (!profile) return;
    
    setLoading(true);
    const { data, error } = await supabase.rpc('get_leaderboard_data', {
      p_location_id: selectedTab === 'local' ? profile.location_id : null
    });
    
    if (error) {
      console.error('Error loading leaderboard:', error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    
    setLoading(false);
  };

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);
  const userRank = users.find(u => u.user_id === profile?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🏆 Community Champions</h1>
        
        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSelectedTab('global')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedTab === 'global' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌍 Global
            </button>
            <button
              onClick={() => setSelectedTab('local')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedTab === 'local' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📍 Local
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-spin mb-4">🏆</div>
          <p>Loading champions...</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          {topThree.length > 0 && <PodiumView topThree={topThree} />}

          {/* Your Rank Card */}
          {userRank && userRank.rank_position > 3 && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">Your Rank</div>
                  <div className="text-3xl font-bold">#{userRank.rank_position}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{userRank.total_points} points</div>
                  <div className="text-sm opacity-90">{userRank.league_tier} League</div>
                </div>
              </div>
            </div>
          )}

          {/* Rest of Rankings */}
          <div className="space-y-3">
            {restOfUsers.map((user, index) => (
              <div 
                key={user.user_id}
                className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between ${
                  user.user_id === profile?.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-gray-500 w-8">
                    #{index + 4}
                  </div>
                  <div>
                    <div className="font-semibold">{user.first_name}</div>
                    <div className="text-sm text-gray-500">{user.league_tier} League</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{user.total_points}</div>
                  <div className="text-xs text-gray-500">{user.survey_count} surveys</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;

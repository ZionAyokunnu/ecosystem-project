import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface StatsData {
  insights: number;
  hearts: number;
  streak: number;
}

export const StatsHeader: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData>({
    insights: 0,
    hearts: 5,
    streak: 0
  });

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('insights, hearts, streak')
        .eq('id', user.id)
        .single();

      if (profile) {
        setStats({
          insights: profile.insights || 0,
          hearts: profile.hearts || 5,
          streak: profile.streak || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Refresh stats when storage event fires (from other components)
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const statItems = [
    {
      type: 'insights',
      icon: '💎',
      count: stats.insights,
      color: 'hsl(220, 90%, 56%)',
      label: 'Insights',
      route: '/wallet'
    },
    {
      type: 'hearts',
      icon: '❤️',
      count: stats.hearts,
      color: 'hsl(0, 84%, 60%)',
      label: 'Energy',
      route: '/profile'
    },
    {
      type: 'streak',
      icon: '🔥',
      count: stats.streak,
      color: 'hsl(38, 92%, 50%)',
      label: 'Streak',
      route: '/profile'
    }
  ];

  return (
    <div className="fixed top-0 right-0 z-50 p-3">
      <div className="flex items-center gap-3">
        {statItems.map((item) => (
          <button
            key={item.type}
            onClick={() => navigate(item.route)}
            className="px-3 py-2 rounded-full
              flex items-center gap-2
              transition-transform duration-200 hover:scale-105
              cursor-pointer"
            style={{ 
              backgroundColor: `${item.color}20`,
              border: `2px solid ${item.color}30`
            }}
          >
            <span className="text-base">{item.icon}</span>
            <span 
              className="text-sm font-bold"
              style={{ color: item.color }}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

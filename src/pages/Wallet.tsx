import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Star, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AnimatedCounter } from '@/components/rewards/AnimatedCounter';
import { BadgeShowcase } from '@/components/rewards/BadgeShowcase';
import { ProgressMilestone } from '@/components/rewards/ProgressMilestone';
import { VoucherCard } from '@/components/rewards/VoucherCard';
import { ActivityTimeline } from '@/components/rewards/ActivityTimeline';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    totalInsights: 0,
    totalPoints: 0,
    currentStreak: 0,
    recentBadges: [],
    availableVouchers: [],
    recentActivity: [],
    nextMilestone: null as any
  });

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    
    try {
      // Load user stats
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('insights, hearts, streak')
        .eq('id', user.id)
        .single();

      // Load recent badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false })
        .limit(6);

      // Load available vouchers
      const { data: vouchers } = await supabase
        .from('user_vouchers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_redeemed', false);

      // Load recent activity (points log)
      const { data: activity } = await supabase
        .from('user_points_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate next milestone
      const currentInsights = userProfile?.insights || 0;
      const nextMilestone = calculateNextMilestone(currentInsights);

      setWalletData({
        totalInsights: currentInsights,
        totalPoints: currentInsights * 10,
        currentStreak: userProfile?.streak || 0,
        recentBadges: badges || [],
        availableVouchers: vouchers || [],
        recentActivity: activity || [],
        nextMilestone
      });
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextMilestone = (currentInsights: number) => {
    const milestones = [25, 50, 100, 250, 500, 1000];
    const next = milestones.find(m => m > currentInsights);
    if (!next) return null;
    
    return {
      target: next,
      current: currentInsights,
      progress: (currentInsights / next) * 100,
      reward: next >= 500 ? '🏆 Legendary Badge' : next >= 100 ? '⭐ Epic Badge' : '🎯 Achievement Badge'
    };
  };

  const handleRedeemVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('user_vouchers')
        .update({ is_redeemed: true })
        .eq('id', voucherId);

      if (error) throw error;

      toast.success('Voucher redeemed! Check your email for details.');
      loadWalletData();
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('Failed to redeem voucher');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💎</div>
          <div className="text-xl font-medium text-muted-foreground">Loading your rewards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-background shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/path')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning
          </Button>
          <h1 className="text-xl font-bold text-foreground">Rewards Center</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section - Animated Totals */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💎</div>
              <h1 className="text-3xl font-bold mb-2">Your Treasure</h1>
              <p className="text-white/80">Rewards earned from your community exploration</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-6 h-6" />
                  <span className="text-lg font-medium">Insights</span>
                </div>
                <AnimatedCounter 
                  value={walletData.totalInsights} 
                  className="text-4xl font-bold"
                />
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6" />
                  <span className="text-lg font-medium">Streak</span>
                </div>
                <div className="text-4xl font-bold">{walletData.currentStreak}</div>
                <div className="text-sm text-white/80">days</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6" />
                  <span className="text-lg font-medium">Vouchers</span>
                </div>
                <div className="text-4xl font-bold">{walletData.availableVouchers.length}</div>
                <div className="text-sm text-white/80">available</div>
              </div>
            </div>
          </div>
          
          {/* Floating coins animation background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 text-4xl animate-bounce opacity-20">💰</div>
            <div className="absolute top-8 right-8 text-3xl animate-pulse opacity-20">⭐</div>
            <div className="absolute bottom-4 left-1/2 text-5xl animate-ping opacity-10">💎</div>
          </div>
        </div>

        {/* Next Milestone Progress */}
        {walletData.nextMilestone && (
          <div className="bg-background rounded-2xl p-6 mb-8 shadow-md">
            <ProgressMilestone milestone={walletData.nextMilestone} />
          </div>
        )}

        {/* Badge Showcase */}
        <div className="bg-background rounded-2xl p-6 mb-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🏆</div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Achievement Gallery</h2>
              <p className="text-muted-foreground">Your collection of community impact badges</p>
            </div>
          </div>
          <BadgeShowcase badges={walletData.recentBadges} />
        </div>

        {/* Available Vouchers */}
        {walletData.availableVouchers.length > 0 && (
          <div className="bg-background rounded-2xl p-6 mb-8 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-foreground">Your Vouchers</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletData.availableVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher}
                  onRedeem={handleRedeemVoucher}
                />
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="bg-background rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          </div>
          <ActivityTimeline activities={walletData.recentActivity} />
        </div>

        {/* Back to Learning CTA */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/path')} 
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🚀 Continue Earning Rewards
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

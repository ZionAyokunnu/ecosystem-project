
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Trophy, Gift, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getUserPoints, getUserBadges, getUserVouchers, redeemVoucher } from '@/services/gamificationApi';
import BadgeRenderer from '@/components/BadgeRenderer';
import VoucherCard from '@/components/VoucherCard';
import { toast } from 'sonner';

const Wallet = () => {
  const { userProfile } = useUser();
  const [points, setPoints] = useState({ total_points: 0, recent_activities: [] });
  const [badges, setBadges] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = userProfile?.name || 'demo-user';

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [pointsData, badgesData, vouchersData] = await Promise.all([
          getUserPoints(userId),
          getUserBadges(userId),
          getUserVouchers(userId)
        ]);
        
        setPoints(pointsData);
        setBadges(badgesData);
        setVouchers(vouchersData);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchWalletData();
    }
  }, [userId]);

  const handleRedeemVoucher = async (voucherId: string) => {
    try {
      await redeemVoucher(voucherId);
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
      toast.success('Voucher redeemed successfully!');
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      toast.error('Failed to redeem voucher');
    }
  };

  const socialValueScore = points.total_points + (badges.length * 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Community Wallet</h1>
          <p className="text-gray-600">Track your contributions and rewards</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-blue-600">{points.total_points}</p>
                </div>
                <Coins className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                  <p className="text-2xl font-bold text-purple-600">{badges.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Social Value Score</p>
                  <p className="text-2xl font-bold text-green-600">{socialValueScore}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Points Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Points Earned</span>
                    <span className="text-2xl font-bold text-blue-600">{points.total_points}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Survey completion: 10 points each</p>
                    <p>• Referral bonus: 20 points each</p>
                    <p>• File upload: 5 points each</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <BadgeRenderer badges={badges} />
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Complete surveys to earn your first badge!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Available Vouchers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vouchers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vouchers.map((voucher) => (
                      <VoucherCard
                        key={voucher.id}
                        voucher={voucher}
                        onRedeem={handleRedeemVoucher}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No vouchers available. Keep participating to earn rewards!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {points.recent_activities.length > 0 ? (
                  <div className="space-y-3">
                    {points.recent_activities.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">
                            {activity.action_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-bold text-green-600">
                          +{activity.points_awarded} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity. Start participating to see your progress!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wallet;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@/react-router-dom';
import PointsTracker from '@/components/PointsTracker';
import BadgeRenderer from '@/components/BadgeRenderer';
import { Award, BookOpen, MapPin } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Welcome, {profile.first_name}</h1>
        <Button onClick={() => navigate('/wallet')}>View Wallet</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Points Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PointsTracker userId={profile.id} />
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeRenderer userId={profile.id} limit={3} />
          </CardContent>
        </Card>

        {/* Survey Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Surveys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!profile.has_completed_onboarding && (
              <Button 
                onClick={() => navigate('/onboarding')}
                className="w-full"
              >
                Complete Onboarding Survey
              </Button>
            )}
            <Button 
              onClick={() => navigate('/overview')}
              variant="outline"
              className="w-full"
            >
              Explore Community Data
            </Button>
          </CardContent>
        </Card>

        {/* Location Info */}
        {profile.location_id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Location ID: {profile.location_id}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

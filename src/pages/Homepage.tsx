
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Users, Award, TrendingUp } from 'lucide-react';
import SmartSearchBox from '@/components/SmartSearchBox';
import WellbeingStatusCard from '@/components/WellbeingStatusCard';

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleGetStarted = () => {
    if (user && profile) {
      if (!profile.has_completed_onboarding) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Community Ecosystem Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Understand the connections in your community. Map relationships between social, 
          economic, and environmental indicators to build a stronger future together.
        </p>
        {user && profile ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">Welcome back, {profile.first_name}!</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard')} size="lg">
                Go to Dashboard
              </Button>
              {!profile.has_completed_onboarding && (
                <Button onClick={() => navigate('/onboarding')} variant="outline" size="lg">
                  Complete Onboarding
                </Button>
              )}
            </div>
            <div className="max-w-2xl mx-auto mb-8">
            <SmartSearchBox />
            </div>
          </div>
        ) : (
          <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-3">
            Get Started
          </Button>
        )}
      </section>

      {/* Wellbeing Status Card */}
      <section className="container mx-auto px-4">
        <WellbeingStatusCard />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Data Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Interactive charts and graphs to explore community indicators and their relationships.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Community Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Participate in surveys to share your insights on how different factors affect your community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
              <CardTitle>Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn points, unlock badges, and receive local rewards for your community participation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Research Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access research-grade analytics and insights about community relationship patterns.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Your Community?</h2>
            <p className="text-xl mb-8">
              Start exploring and contributing to your community's future today.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="secondary" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              Sign Up Now
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Homepage;

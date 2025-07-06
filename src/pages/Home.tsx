
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IntroAnimation } from '@/components/animations/IntroAnimation';
import { HeroSection } from '@/components/HeroSection';
import { VideoInsightCard } from '@/components/VideoInsightCard';
import { AnimatedMetrics } from '@/components/animations/AnimatedMetrics';
import { CommunityWallet } from '@/components/CommunityWallet';
import { EcosystemCTA } from '@/components/animations/EcosystemCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Users, Award, TrendingUp } from 'lucide-react';
import SmartSearchBox from '@/components/SmartSearchBox';
import WellbeingStatusCard from '@/components/WellbeingStatusCard';

const Home = () => {
  const [showIntro, setShowIntro] = useState(true);
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
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const insightCards = [
    {
      title: "Altruism is improving in St Neots",
      description: "Community wellbeing metrics show declining trends",
      videoId: "happiness-decline"
    },
    {
      title: "Employment growth slowing in Cambridge",
      description: "Economic indicators reveal workforce challenges",
      videoId: "employment-trends"
    },
    {
      title: "Green spaces boosting mental health",
      description: "Environmental factors correlate with wellness",
      videoId: "green-spaces"
    }
  ];

  if (showIntro) {
    return <IntroAnimation />;
  }

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
     
      {/* Hero Section */}
      <HeroSection />
       
      {/* Video Insight Cards */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insightCards.map((card, index) => (
            <VideoInsightCard
              key={index}
              title={card.title}
              description={card.description}
              videoId={card.videoId}
              delay={index * 200}
            />
          ))}
        </div>
      </section>

      {/* Animated Metrics */}
      <section className="py-20 bg-gray-50">
        <AnimatedMetrics />
      </section>

      {/* Community Wallet Preview */}
      <section className="py-20 px-4">
        <CommunityWallet />
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-black text-white">
        <EcosystemCTA />
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IntroAnimation } from '@/components/animations/IntroAnimation';
import { HeroSection } from '@/components/animations/HeroSection';
import { VideoInsightCard } from '@/components/animations/VideoInsightCard';
import { AnimatedMetrics } from '@/components/animations/AnimatedMetrics';
import { CommunityWallet } from '@/components/animations/CommunityWallet';
import { EcosystemCTA } from '@/components/animations/EcosystemCTA';

const Home = () => {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const insightCards = [
    {
      title: "Happiness is falling in St Neots",
      description: "Community wellbeing metrics show declining trends",
      videoId: "happiness-decline"
    },
    {
      title: "Employment growth slowing in Durham",
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
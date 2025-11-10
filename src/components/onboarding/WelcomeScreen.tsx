import React, { useState } from 'react';
import { MascotGuide } from './MascotGuide';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [showMascot, setShowMascot] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const handleGetStarted = () => {
    setShowMascot(true);
  };

  const handleContinue = () => {
    setAnimationStep(1);
    setTimeout(() => {
      setShowMascot(false);
      onContinue();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-20 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce" />
        <div className="absolute bottom-16 left-20 w-20 h-20 bg-purple-200 rounded-full opacity-25 animate-ping" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        {/* Main Hero */}
        <div className={`transition-all duration-1000 ${
          animationStep === 0 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-8'
        }`}>
          <div className="text-8xl md:text-9xl mb-8 animate-bounce-soft">🌟</div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Welcome to<br />
            <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Community Insights
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover how your community works, share your voice, and make a real difference - 
            one fun lesson at a time! 🚀
          </p>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Learn & Explore</h3>
              <p className="text-gray-600 text-sm">
                Daily lessons about your community that are fun and easy to understand
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Earn Rewards</h3>
              <p className="text-gray-600 text-sm">
                Collect badges, insights, and climb the leaderboard as you participate
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Make Impact</h3>
              <p className="text-gray-600 text-sm">
                Your voice helps improve your community for everyone
              </p>
            </div>
          </div>

          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 Let's Get Started!
          </Button>
        </div>
      </div>

      {/* Mascot Introduction */}
      {showMascot && (
        <MascotGuide
          message="Hi there! I'm Sage, your community guide! I'll help you discover amazing things about your neighborhood. Ready to begin your journey? 🌟"
          emoji="🦉"
          position="center"
          showContinue={true}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};
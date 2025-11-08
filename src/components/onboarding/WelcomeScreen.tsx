import React from 'react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-success via-success-light to-success-bg flex items-center justify-center p-4 overflow-hidden">
      {/* Floating mascot */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-8xl animate-gentle-float">
        🌱
      </div>

      {/* Main content card */}
      <div className="relative w-full max-w-xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 animate-scale-in">
          {/* Mascot positioned on card edge */}
          <div className="absolute -top-10 -left-10 text-8xl animate-bounce-soft">
            🌱
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 text-center pt-8">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Discover Your Community Ecosystem
            </h1>
            
            <p className="text-xl font-medium text-gray-600">
              Learn how everything in your area connects
            </p>

            <p className="text-base text-gray-600 leading-relaxed max-w-md mx-auto">
              Join thousands exploring the relationships between environment, society, and wellbeing in their communities.
            </p>

            {/* CTA Button */}
            <div className="mt-4">
              <Button
                onClick={onContinue}
                className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-to-r from-success to-success-light hover:from-success-hover hover:to-success shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <span className="mr-2 text-xl">🚀</span>
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
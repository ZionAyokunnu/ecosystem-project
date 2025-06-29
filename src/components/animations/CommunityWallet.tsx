
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CommunityWallet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const targetPoints = 2847;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = targetPoints / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetPoints) {
          setAnimatedPoints(targetPoints);
          clearInterval(timer);
        } else {
          setAnimatedPoints(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, targetPoints]);

  const badges = [
    { name: 'Data Pioneer', color: 'bg-black', earned: true },
    { name: 'Community Voice', color: 'bg-gray-600', earned: true },
    { name: 'Insight Builder', color: 'bg-gray-400', earned: true },
    { name: 'Future Shaper', color: 'bg-gray-300', earned: false },
  ];

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto">
      <Card className={`p-8 bg-white border-0 shadow-xl transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-black mb-4">Community Wallet</h2>
          <p className="text-gray-600 text-lg">
            Earn points and badges for every insight you share.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Points Section */}
          <div className="text-center">
            <div className="relative mb-6">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-gray-200 rounded-full animate-pulse opacity-30" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-gray-300 rounded-full animate-pulse opacity-50" 
                     style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Points display */}
              <div className="relative z-10 flex flex-col items-center justify-center h-32">
                <div className="text-4xl font-light text-black animate-pulse-glow">
                  {animatedPoints.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-light tracking-wide">
                  IMPACT POINTS
                </div>
              </div>

              {/* Floating particles around points */}
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-black rounded-full animate-float opacity-60"
                  style={{
                    left: `${50 + Math.cos(i * Math.PI / 3) * 25}%`,
                    top: `${50 + Math.sin(i * Math.PI / 3) * 25}%`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-light text-center mb-6">Achievement Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`transform transition-all duration-500 ${
                    isVisible 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    badge.earned 
                      ? 'border-black bg-gray-50 hover:bg-gray-100' 
                      : 'border-gray-300 bg-gray-50 opacity-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${badge.color} ${
                        badge.earned ? 'animate-pulse-glow' : ''
                      }`} />
                      <span className={`text-sm font-light ${
                        badge.earned ? 'text-black' : 'text-gray-400'
                      }`}>
                        {badge.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Next milestone: 3,000 points</span>
            <span>{Math.round((animatedPoints / 3000) * 100)}% complete</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((animatedPoints / 3000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
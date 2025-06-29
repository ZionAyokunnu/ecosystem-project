
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export const EcosystemCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Ecosystem Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20">
          {/* Central hub */}
          <circle cx="50%" cy="50%" r="20" fill="white" className="animate-pulse" />
          
          {/* Growing network connections */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const radius = 150;
            const x = 50 + Math.cos(angle) * (radius / 8);
            const y = 50 + Math.sin(angle) * (radius / 8);
            
            return (
              <g key={i} className={isVisible ? 'animate-grow-network' : ''} 
                 style={{ animationDelay: `${i * 0.1}s` }}>
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${x}%`}
                  y2={`${y}%`}
                  stroke="white"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle cx={`${x}%`} cy={`${y}%`} r="8" fill="white" opacity="0.8" />
                
                {/* Secondary connections */}
                {Array.from({ length: 3 }, (_, j) => {
                  const subAngle = angle + (j - 1) * 0.3;
                  const subRadius = 80;
                  const subX = x + Math.cos(subAngle) * (subRadius / 8);
                  const subY = y + Math.sin(subAngle) * (subRadius / 8);
                  
                  return (
                    <g key={j}>
                      <line
                        x1={`${x}%`}
                        y1={`${y}%`}
                        x2={`${subX}%`}
                        y2={`${subY}%`}
                        stroke="white"
                        strokeWidth="0.5"
                        opacity="0.4"
                      />
                      <circle cx={`${subX}%`} cy={`${subY}%`} r="3" fill="white" opacity="0.6" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full opacity-70 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className={`mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <h2 className="text-4xl md:text-6xl font-light text-white mb-8 leading-tight">
            Every voice maps the invisible.
          </h2>
          <h3 className="text-3xl md:text-5xl font-light text-white mb-12 leading-tight">
            Every insight strengthens the whole.
          </h3>
        </div>

        <div className={`flex flex-col sm:flex-row gap-8 justify-center items-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`} style={{ transitionDelay: '0.3s' }}>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 px-12 py-6 text-xl font-light tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Join the Movement
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white hover:text-black px-12 py-6 text-xl font-light tracking-wide transition-all duration-300 hover:scale-105"
          >
            Explore the Data
          </Button>
        </div>

        {/* Network growth indicator */}
        <div className={`mt-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`} style={{ transitionDelay: '0.6s' }}>
          <div className="flex items-center justify-center space-x-4 text-white opacity-80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-light">Growing network</span>
            </div>
            <div className="w-px h-4 bg-white opacity-50" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-sm font-light">Live insights</span>
            </div>
            <div className="w-px h-4 bg-white opacity-50" />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-sm font-light">Real impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
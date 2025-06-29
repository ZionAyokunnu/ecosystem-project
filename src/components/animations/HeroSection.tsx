
import React from 'react';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Network Animation */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-10">
          {/* Animated connection network */}
          {Array.from({ length: 15 }, (_, i) => (
            <g key={i}>
              <circle
                cx={Math.random() * 100 + '%'}
                cy={Math.random() * 100 + '%'}
                r="2"
                fill="black"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            </g>
          ))}
          
          {/* Connection lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={i}
              x1={Math.random() * 100 + '%'}
              y1={Math.random() * 100 + '%'}
              x2={Math.random() * 100 + '%'}
              y2={Math.random() * 100 + '%'}
              stroke="black"
              strokeWidth="0.5"
              opacity="0.3"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Floating Data Points */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div className="w-2 h-2 bg-black rounded-full animate-pulse-glow" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">
            See the invisible forces behind your community's wellbeing.
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" 
             style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg font-light tracking-wide transition-all duration-300 hover:scale-105"
          >
            Explore the Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-black text-black hover:bg-black hover:text-white px-8 py-6 text-lg font-light tracking-wide transition-all duration-300 hover:scale-105"
          >
            Watch How It Works
          </Button>
        </div>

        {/* Subtle brand identity */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-sm font-light text-gray-600 tracking-widest uppercase">
            The Ecosystem Project
          </h2>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-black rounded-full flex justify-center">
          <div className="w-1 h-3 bg-black rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};
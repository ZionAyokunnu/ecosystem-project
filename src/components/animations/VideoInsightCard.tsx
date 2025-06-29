
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VideoInsightCardProps {
  title: string;
  description: string;
  videoId: string;
  delay?: number;
}

export const VideoInsightCard: React.FC<VideoInsightCardProps> = ({ 
  title, 
  description, 
  videoId, 
  delay = 0 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <Card
      ref={cardRef}
      className={`group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
        isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview Area */}
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
        {/* Simulated video background with animated elements */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Data visualization simulation */}
            <div className="w-full h-full relative">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              
              {/* Chart lines */}
              <svg className="absolute inset-0 w-full h-full opacity-40">
                <path
                  d="M 0,150 Q 50,100 100,120 T 200,80 T 300,160"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Play indicator */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`}>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-medium mb-3 text-black group-hover:text-gray-800 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="border-black text-black hover:bg-black hover:text-white transition-all duration-300"
        >
          See Insights
        </Button>
      </div>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Users, Globe, Database } from 'lucide-react';

export const AnimatedMetrics = () => {
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

  const metrics = [
    {
      icon: Database,
      number: "180+",
      text: "ripple effects mapped",
      animation: "chart-to-people"
    },
    {
      icon: Globe,
      number: "5",
      text: "Aligned with UN & WHO, UK GOV targets",
      animation: "globe-to-icons"
    },
    {
      icon: Users,
      number: "∞",
      text: "Every choice changes something",
      animation: "tap-ripples"
    }
  ];

  return (
    <div ref={sectionRef} className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`text-center transform transition-all duration-700 ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-12 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Animated Icon Container */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                {/* Background animation circles */}
                <div className="absolute inset-0 -m-4">
                  <div className="w-20 h-20 border border-gray-300 rounded-full animate-pulse opacity-30" />
                </div>
                <div className="absolute inset-0 -m-2">
                  <div className="w-16 h-16 border border-gray-400 rounded-full animate-pulse opacity-50" 
                       style={{ animationDelay: '0.5s' }} />
                </div>
                
                {/* Main icon */}
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center animate-float">
                  <metric.icon className="w-6 h-6 text-white" />
                </div>

                {/* Morphing elements for visual storytelling */}
                {metric.animation === 'chart-to-people' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6">
                    <svg className="w-full h-full animate-pulse">
                      <circle cx="12" cy="12" r="2" fill="black" opacity="0.6" />
                      <circle cx="8" cy="16" r="1.5" fill="black" opacity="0.4" />
                      <circle cx="16" cy="16" r="1.5" fill="black" opacity="0.4" />
                    </svg>
                  </div>
                )}

                {metric.animation === 'globe-to-icons' && (
                  <div className="absolute -bottom-2 -left-2 flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                )}

                {metric.animation === 'tap-ripples' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 rounded-full animate-ripple opacity-60" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="text-4xl font-light text-black animate-pulse-glow">
                {metric.number}
              </div>
              <p className="text-gray-700 text-lg font-light leading-relaxed max-w-xs mx-auto">
                {metric.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
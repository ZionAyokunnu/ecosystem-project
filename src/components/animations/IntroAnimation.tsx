
import React, { useEffect, useState } from 'react';

export const IntroAnimation = () => {
  const [showTagline, setShowTagline] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    // Show tagline after ripple starts
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 1000);

    return () => clearTimeout(taglineTimer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Ripple Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-full animate-ripple"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-ripple absolute" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-4 h-4 bg-white rounded-full animate-ripple absolute" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full animate-particles opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      {/* Tagline */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
        showTagline ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light text-white mb-4 tracking-wide">
            Trace the Ripples.
          </h1>
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-wide">
            Shape the Future.
          </h2>
        </div>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <radialGradient id="connectionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${50 + Math.cos(i * Math.PI / 4) * 40}%`}
            y2={`${50 + Math.sin(i * Math.PI / 4) * 40}%`}
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>
    </div>
  );
};
import React, { useEffect } from 'react';

interface WelcomeToPathProps {
  domain: string;
  level: string;
  onComplete: () => void;
}

export const WelcomeToPath: React.FC<WelcomeToPathProps> = ({ domain, level, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-success via-success-light to-success-bg flex items-center justify-center z-50 animate-scale-in">
      <div className="text-center space-y-6 px-4">
        {/* Celebration emoji */}
        <div className="text-9xl animate-bounce-soft">
          🎉
        </div>

        {/* Main message */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to your ecosystem journey!
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            You're ready to explore <span className="font-bold">{domain}</span> in your community
          </p>
        </div>

        {/* Badge */}
        <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
          <p className="text-lg font-semibold text-white">
            {level} Explorer unlocked! 🌟
          </p>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="block mx-auto mt-8 text-white text-lg hover:underline underline-offset-4 transition-all"
        >
          Start exploring →
        </button>
      </div>
    </div>
  );
};
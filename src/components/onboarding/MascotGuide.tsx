import React, { useState, useEffect } from 'react';

interface MascotGuideProps {
  message: string;
  emoji?: string;
  position?: 'bottom-right' | 'center' | 'top-left';
  showContinue?: boolean;
  onContinue?: () => void;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  message,
  emoji = '🦉',
  position = 'bottom-right',
  showContinue = false,
  onContinue
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [message]);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'center': 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <div className={`${positionClasses[position]} z-50 transition-all duration-500 ${
      visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
    }`}>
      <div className="relative">
        {/* Mascot */}
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg flex items-center justify-center text-3xl animate-bounce-soft">
          {emoji}
        </div>
        
        {/* Speech Bubble */}
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl px-4 py-3 shadow-xl max-w-xs animate-fade-in">
          <div className="text-sm font-medium text-gray-800">{message}</div>
          
          {showContinue && (
            <button
              onClick={onContinue}
              className="mt-3 w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Got it! ✨
            </button>
          )}
          
          {/* Speech bubble arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
        </div>
      </div>
    </div>
  );
};

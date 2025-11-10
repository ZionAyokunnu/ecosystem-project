import React, { useEffect, useState } from 'react';

interface AnswerFeedbackProps {
  show: boolean;
  type: 'correct' | 'good' | 'complete';
  message: string;
  onComplete: () => void;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  show,
  type,
  message,
  onComplete
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto-hide after 1.5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !visible) return null;

  const icons = {
    correct: '✅',
    good: '⭐',
    complete: '🎉'
  };

  const colors = {
    correct: 'from-green-400 to-green-600',
    good: 'from-yellow-400 to-orange-500',
    complete: 'from-purple-400 to-pink-600'
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-black/20 absolute inset-0" />
      <div className={`relative bg-gradient-to-br ${colors[type]} text-white rounded-3xl px-8 py-6 shadow-2xl transform transition-all duration-300 ${visible ? 'scale-100' : 'scale-75'}`}>
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">{icons[type]}</div>
          <div className="text-xl font-bold">{message}</div>
        </div>
        
        {/* Confetti effect for complete */}
        {type === 'complete' && visible && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-2 text-yellow-300 animate-ping">✨</div>
            <div className="absolute top-4 right-4 text-yellow-300 animate-pulse delay-200">⭐</div>
            <div className="absolute bottom-3 left-1/2 text-yellow-300 animate-bounce delay-500">🎊</div>
          </div>
        )}
      </div>
    </div>
  );
};

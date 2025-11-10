import React, { ReactNode } from 'react';

interface MobileSurveyLayoutProps {
  children: ReactNode;
  progress: number;
  totalQuestions: number;
  currentQuestion: number;
  onBack?: () => void;
  showMascot?: boolean;
  mascotMessage?: string;
}

export const MobileSurveyLayout: React.FC<MobileSurveyLayoutProps> = ({
  children,
  progress,
  totalQuestions,
  currentQuestion,
  onBack,
  showMascot = true,
  mascotMessage = "You're doing great! 🌟"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 relative">
      {/* Mobile-First Progress Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 safe-top">
        <div className="flex items-center justify-between mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-95 transition-transform"
            >
              ←
            </button>
          )}
          <span className="text-sm font-medium text-gray-600">
            {currentQuestion} of {totalQuestions}
          </span>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
        
        {/* Progress Bar - Larger on mobile */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content - Mobile optimized */}
      <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {children}
      </div>

      {/* Floating Mascot - Mobile positioned */}
      {showMascot && (
        <div className="fixed bottom-20 right-4 z-20">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl animate-bounce">
              🦉
            </div>
            {mascotMessage && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl px-4 py-2 shadow-lg max-w-48 animate-fade-in">
                <div className="text-sm font-medium text-gray-800">{mascotMessage}</div>
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

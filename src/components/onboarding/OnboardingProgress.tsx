import React from 'react';

interface Step {
  id: string;
  label: string;
  icon: string;
}

const steps: Step[] = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'domain', label: 'Focus Area', icon: '🎯' },
  { id: 'knowledge', label: 'Knowledge Check', icon: '📝' },
  { id: 'goals', label: 'Goals', icon: '🏆' },
  { id: 'notifications', label: 'Reminders', icon: '🔔' }
];

interface OnboardingProgressProps {
  currentStep: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-4xl mx-auto px-10 py-4">
        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mb-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success to-success-light transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                      ${isCompleted ? 'bg-success text-white' : ''}
                      ${isCurrent ? 'bg-blue-500 text-white scale-110' : ''}
                      ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                    `}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-8 h-0.5 ${isCompleted ? 'bg-success' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
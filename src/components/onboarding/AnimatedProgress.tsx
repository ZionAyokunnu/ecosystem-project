import React from 'react';

interface AnimatedProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  currentStep,
  totalSteps,
  stepLabels
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-4">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`text-xs font-medium transition-colors ${
              index + 1 <= currentStep ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {index + 1 <= currentStep && '✓ '}{label}
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

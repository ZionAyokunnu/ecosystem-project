import React, { useState } from 'react';
import { AnimatedProgress } from './AnimatedProgress';
import { MascotGuide } from './MascotGuide';
import { Button } from '@/components/ui/button';

interface GoalOption {
  id: string;
  surveys: number;
  title: string;
  subtitle: string;
  timeEstimate: string;
  icon: string;
  gradient: string;
  textColor: string;
  recommended?: boolean;
}

const goalOptions: GoalOption[] = [
  {
    id: 'light',
    surveys: 1,
    title: 'Light Explorer',
    subtitle: '1 insight per day',
    timeEstimate: '~5 minutes daily',
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
    textColor: '#374151'
  },
  {
    id: 'regular',
    surveys: 3,
    title: 'Community Researcher',
    subtitle: '3 insights per day',
    timeEstimate: '~15 minutes daily',
    icon: '🔬',
    gradient: 'linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%)',
    textColor: '#1D4ED8',
    recommended: true
  },
  {
    id: 'intensive',
    surveys: 5,
    title: 'Ecosystem Expert',
    subtitle: '5 insights per day',
    timeEstimate: '~25 minutes daily',
    icon: '🏆',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    textColor: '#D97706'
  }
];

interface GoalSettingProps {
  onSelect: (goal: GoalOption) => void;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string>('regular');

  const handleContinue = () => {
    const selectedGoal = goalOptions.find(g => g.id === selected);
    if (selectedGoal) {
      onSelect(selectedGoal);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <AnimatedProgress
          currentStep={3}
          totalSteps={5}
          stepLabels={['Welcome', 'Interest', 'Goals', 'Test', 'Ready!']}
        />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🎯 Set Your Goals
          </h1>
          <p className="text-lg text-gray-600">
            Let's set some friendly goals to keep you motivated!
          </p>
        </div>

        {/* Goal options */}
        <div className="space-y-4 mb-8">
          {goalOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`
                relative w-full p-5 rounded-2xl transition-all duration-300
                ${selected === option.id
                  ? 'border-[3px] border-green-500 scale-[1.02] shadow-lg'
                  : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={{
                background: option.gradient,
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Recommended badge */}
              {option.recommended && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-xl shadow-md animate-bounce-soft">
                  RECOMMENDED
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="text-4xl flex-shrink-0">
                  {option.icon}
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold mb-0.5" style={{ color: option.textColor }}>
                    {option.title}
                  </h3>
                  <p className="text-sm font-semibold mb-1" style={{ color: option.textColor }}>
                    {option.subtitle}
                  </p>
                  <p className="text-xs opacity-75" style={{ color: option.textColor }}>
                    {option.timeEstimate}
                  </p>
                </div>

                {/* Selection indicator */}
                {selected === option.id && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 animate-scale-in">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Continue
          </Button>
        </div>

        <MascotGuide
          message="Setting goals helps you stay motivated! Don't worry - you can adjust these anytime. You're in control! 💪"
          position="bottom-right"
        />
      </div>
    </div>
  );
};
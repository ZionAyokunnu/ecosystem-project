import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { EcosystemDomain } from './EcosystemPicker';

const conceptOptions: Record<string, string[]> = {
  environment: ['Climate action', 'Biodiversity', 'Sustainable living', 'Green infrastructure'],
  social: ['Community events', 'Volunteer networks', 'Cultural diversity', 'Neighborhood safety'],
  economy: ['Local businesses', 'Job opportunities', 'Innovation hubs', 'Affordable housing'],
  health: ['Healthcare access', 'Mental health support', 'Active lifestyle', 'Community wellness'],
  education: ['Skill development', 'Learning resources', 'Career pathways', 'Digital literacy'],
  explore: ['System connections', 'Data patterns', 'Research insights', 'Complex relationships']
};

const likertOptions = [
  { value: 1, label: 'Strongly disagree', points: 5 },
  { value: 2, label: 'Somewhat disagree', points: 15 },
  { value: 3, label: 'Neither agree nor disagree', points: 25 },
  { value: 4, label: 'Somewhat agree', points: 35 },
  { value: 5, label: 'Strongly agree', points: 45 }
];

interface KnowledgeCheckProps {
  selectedDomain: EcosystemDomain;
  onComplete: (score: number, unlockedUnit: number) => void;
}

export const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ selectedDomain, onComplete }) => {
  const [confidenceLevel, setConfidenceLevel] = useState<number>(1);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [understandingLevel, setUnderstandingLevel] = useState<number | null>(null);

  const canContinue = selectedConcept !== null && understandingLevel !== null;

  const handleSubmit = () => {
    if (!canContinue) return;

    // Calculate score
    const confidenceScore = confidenceLevel * 20;
    const conceptScore = selectedConcept ? 15 : 0;
    const likertScore = likertOptions.find(opt => opt.value === understandingLevel)?.points || 0;
    const totalScore = confidenceScore + conceptScore + likertScore;

    // Determine starting unit (score ≥ 60 = Unit 3, otherwise Unit 1)
    const unlockedUnit = totalScore >= 60 ? 3 : 1;

    onComplete(totalScore, unlockedUnit);
  };

  const concepts = conceptOptions[selectedDomain.id] || conceptOptions.explore;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Question 1: Confidence Slider */}
        <div className="bg-gray-100 rounded-2xl p-8 animate-slide-up">
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            How familiar are you with <span className="font-bold text-success">{selectedDomain.title.toLowerCase()}</span> in your community?
          </h3>

          <div className="space-y-4">
            <Slider
              value={[confidenceLevel]}
              onValueChange={(value) => setConfidenceLevel(value[0])}
              min={0}
              max={3}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-gray-600 px-1">
              <span>Not familiar</span>
              <span className="hidden sm:inline">Somewhat familiar</span>
              <span className="hidden sm:inline">Quite familiar</span>
              <span>Very familiar</span>
            </div>
          </div>
        </div>

        {/* Question 2: Concept Connection */}
        <div className="bg-white rounded-2xl p-8 shadow-md animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            Which of these feels most connected to <span className="font-bold text-success">{selectedDomain.title.toLowerCase()}</span>?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {concepts.map((concept) => (
              <button
                key={concept}
                onClick={() => setSelectedConcept(concept)}
                className={`
                  p-4 rounded-xl text-center text-sm font-medium transition-all duration-200
                  ${selectedConcept === concept
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-700 scale-105'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {concept}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Impact Understanding */}
        <div className="bg-white rounded-2xl p-8 shadow-md animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            I understand how <span className="font-bold text-success">{selectedDomain.title.toLowerCase()}</span> affects other aspects of community life
          </h3>

          <div className="space-y-3">
            {likertOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setUnderstandingLevel(option.value)}
                className={`
                  w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-200
                  ${understandingLevel === option.value
                    ? 'bg-green-50 border-2 border-success text-gray-900 scale-[1.02]'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canContinue}
            className="w-full max-w-xs h-14 text-lg font-semibold bg-gradient-to-r from-success to-success-light hover:from-success-hover hover:to-success disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
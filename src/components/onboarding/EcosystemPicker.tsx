import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface EcosystemDomain {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  textColor: string;
}

const ecosystemDomains: EcosystemDomain[] = [
  {
    id: 'altruism',
    title: 'Altruism',
    description: 'Giving to others, helping others, community service',
    icon: '💖',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'information',
    title: 'Information',
    description: 'Learning about the community, the people, the culture',
    icon: '💡',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'love',
    title: 'Love & Interest',
    description: 'Love for the community, the people, the culture',
    icon: '💕',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    description: 'Physical and mental health resources',
    icon: '🏥',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'education',
    title: 'Education & Skills',
    description: 'Learning opportunities, skill development',
    icon: '📚',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'dignity',
    title: 'Dignity',
    description: 'Respect for the community, the people, the culture',
    icon: '💪',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    description: 'Safety for the community, the people, the culture',
    icon: '🔒',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    textColor: '#FFFFFF'
  },
  {
    id: 'explore',
    title: 'Explore Everything',
    description: 'I want to learn about all connections',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    textColor: '#FFFFFF'
  }
];

interface EcosystemPickerProps {
  onSelect: (domain: EcosystemDomain) => void;
}

export const EcosystemPicker: React.FC<EcosystemPickerProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (domain: EcosystemDomain) => {
    setSelected(domain.id);
    // Auto-advance after a brief moment to show selection
    setTimeout(() => onSelect(domain), 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Choose your focus area
          </h2>
          <p className="text-lg text-gray-600">
            What aspect of your community interests you most?
          </p>
        </div>

        {/* Domain cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-scale-in">
          {ecosystemDomains.map((domain, index) => (
            <button
              key={domain.id}
              onClick={() => handleSelect(domain)}
              className={`
                group relative w-full h-32 rounded-2xl p-5 cursor-pointer
                transition-all duration-200
                hover:-translate-y-1 hover:shadow-xl
                ${selected === domain.id ? 'scale-105 ring-4 ring-success shadow-2xl' : 'shadow-md'}
              `}
              style={{
                background: domain.gradient,
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Icon */}
              <div className="text-4xl mb-2">{domain.icon}</div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1" style={{ color: domain.textColor }}>
                  {domain.title}
                </h3>
                <p className="text-sm opacity-90" style={{ color: domain.textColor }}>
                  {domain.description}
                </p>
              </div>

              {/* Selection indicator */}
              {selected === domain.id && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-scale-in">
                  <span className="text-xl">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
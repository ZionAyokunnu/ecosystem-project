
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEcosystem } from '@/context/EcosystemContext';
import { usePrediction } from '@/hooks/usePrediction';
import { Badge } from '@/components/ui/badge';

const WellbeingStatusCard: React.FC = () => {
  const { indicators } = useEcosystem();
  
  // Find wellbeing indicator
  const wellbeingIndicator = useMemo(() => {
    return indicators.find(indicator => 
      indicator.name.toLowerCase().includes('wellbeing') ||
      indicator.name.toLowerCase().includes('happiness') ||
      indicator.name.toLowerCase().includes('well-being')
    ) || null;
  }, [indicators]);

  const { prediction } = usePrediction(wellbeingIndicator);

  const { percentageText, currentLevel, trend, locationName } = useMemo(() => {
    if (!wellbeingIndicator) {
      return {
        currentLevel: null,
        percentageText: 'Happiness data not available',
        trend: 'stay the same',
        locationName: 'St Neots'
      };
    }

    const currentValue = wellbeingIndicator.current_value;

    const percentageText = `${Math.round(currentValue)}% of people report happiness`;
    
    // Determine current level
    let level: string;
    if (currentValue < 40) {
      level = 'Low';
    } else if (currentValue <= 70) {
      level = 'Average';
    } else {
      level = 'High';
    }

    // Determine trend
    let trendText = 'stay the same';
    if (prediction && prediction.values.length >= 2) {
      const predictedValue = prediction.values[prediction.values.length - 1];
      const difference = predictedValue - currentValue;
      
      if (difference >= 5) {
        trendText = 'rise';
      } else if (difference <= -5) {
        trendText = 'fall';
      }
    }

    return {
      percentageText,
      currentLevel: level,
      trend: trendText,
      locationName: 'St Neots' // Could be made dynamic based on user's location
    };
  }, [wellbeingIndicator, prediction]);

  const statusText = useMemo(() => {
    if (!wellbeingIndicator || !currentLevel) {
      return "Happiness data not available.";
    }
    
    return `${percentageText} in ${locationName} as ${currentLevel} and is expected to ${trend}.`;
  }, [wellbeingIndicator, percentageText, currentLevel, trend, locationName]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <Card className="relative bg-gradient-to-r from-gray-600 to-gray-500 border-none shadow-lg">
          <Badge variant="destructive" className="absolute top-4 left-4 uppercase text-xs font-semibold px-2 py-1 rounded-full mb-1">
            Live
          </Badge>
          <CardContent className="p-8 md:p-12">
          <p className="text-white text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-relaxed">
            {statusText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellbeingStatusCard;

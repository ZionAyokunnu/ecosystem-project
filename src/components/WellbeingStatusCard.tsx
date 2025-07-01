
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEcosystem } from '@/context/EcosystemContext';
import { usePrediction } from '@/hooks/usePrediction';

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

  const { percentageText, trend, locationName } = useMemo(() => {
    if (!wellbeingIndicator) {
      return {
        percentageText: 'Happiness data not available',
        trend: 'stay the same',
        locationName: 'St Neots'
      };
    }

    const currentValue = wellbeingIndicator.current_value;
    
    // Convert current value to percentage format: "X% of people report high happiness"
    const percentageText = `${Math.round(currentValue)}% of people report high happiness`;

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
      trend: trendText,
      locationName: 'St Neots' // Could be made dynamic based on user's location
    };
  }, [wellbeingIndicator, prediction]);

  const statusText = useMemo(() => {
    if (!wellbeingIndicator) {
      return "Happiness data not available.";
    }
    
    return `${percentageText} in ${locationName} and is expected to ${trend}.`;
  }, [wellbeingIndicator, percentageText, trend, locationName]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 border-none shadow-lg">
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

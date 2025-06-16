
import { useState, useEffect } from 'react';
import { Indicator } from '@/types';

export interface PredictionResult {
  indicator_id: string;
  years: number[];
  values: number[];
  summary: string;
}

export const usePrediction = (indicator: Indicator | null) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!indicator) {
      setPrediction(null);
      return;
    }

    const generatePrediction = async () => {
      setLoading(true);
      
      // Simulate prediction logic - in a real app this would call an API
      const currentYear = new Date().getFullYear();
      const currentValue = indicator.current_value;
      
      // Simple trend calculation based on current value
      const trendFactor = currentValue > 50 ? 0.95 : 1.05; // Values above 50 tend to decline, below 50 tend to improve
      const volatility = Math.random() * 10 - 5; // Random volatility
      
      const predictedValue = Math.max(0, Math.min(100, currentValue * trendFactor + volatility));
      
      const result: PredictionResult = {
        indicator_id: indicator.indicator_id,
        years: [currentYear, currentYear + 1],
        values: [currentValue, predictedValue],
        summary: `Predicted to ${predictedValue > currentValue ? 'increase' : 'decrease'} from ${currentValue.toFixed(1)} to ${predictedValue.toFixed(1)}`
      };
      
      setPrediction(result);
      setLoading(false);
    };

    generatePrediction();
  }, [indicator]);

  return { prediction, loading };
};

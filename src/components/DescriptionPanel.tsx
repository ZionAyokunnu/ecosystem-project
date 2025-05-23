
import React from 'react';
import { Indicator } from '@/types';

interface DescriptionPanelProps {
  coreIndicator: Indicator;
  positiveDrivers: Indicator[];
  negativeDrivers: Indicator[];
  recommendations?: string[];
  correlations?: Record<string, number>; // Added to display correlation scores
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({
  coreIndicator,
  positiveDrivers,
  negativeDrivers,
  recommendations = [],
  correlations = {}
}) => {
  const renderIndicatorList = (indicators: Indicator[], type: 'positive' | 'negative') => {
    if (indicators.length === 0) {
      return <p className="text-gray-500 italic">No {type === 'positive' ? 'thriving' : 'lagging'} drivers identified.</p>;
    }
    
    return (
      <ul className="mt-1 space-y-1">
        {indicators.map(indicator => {
          const correlation = correlations[indicator.indicator_id];
          const correlationText = correlation !== undefined 
            ? ` (${(correlation * 100).toFixed(1)}%)` 
            : '';
          
          return (
            <li key={indicator.indicator_id} className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                type === 'positive' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span>
                {indicator.name} ({indicator.current_value.toFixed(1)})
                <span className="text-gray-500 text-sm">{correlationText}</span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{coreIndicator.name} Overview</h2>
        <div className="flex items-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ 
              background: coreIndicator.current_value > 66 
                ? 'linear-gradient(to right, #00b09b, #96c93d)' 
                : coreIndicator.current_value > 33 
                  ? 'linear-gradient(to right, #ff9966, #ff5e62)' 
                  : 'linear-gradient(to right, #cb2d3e, #ef473a)' 
            }}
          >
            {coreIndicator.current_value.toFixed(1)}
          </div>
          <div className="ml-4">
            <p className="text-gray-600">{coreIndicator.description || `Analysis of current state and trends for ${coreIndicator.name}.`}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-green-700 mb-1">Thriving Drivers</h3>
          {renderIndicatorList(positiveDrivers, 'positive')}
        </div>
        <div>
          <h3 className="font-medium text-red-700 mb-1">Lagging Drivers</h3>
          {renderIndicatorList(negativeDrivers, 'negative')}
        </div>
      </div>
      
      {recommendations && recommendations.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium text-gray-800 mb-2">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DescriptionPanel;

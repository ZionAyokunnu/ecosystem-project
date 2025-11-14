
import { useMemo } from 'react';
import { Indicator, Relationship } from '../types';

export const useRecommendations = (
  laggingDrivers: Indicator[],
  thrivingDrivers: Indicator[],
  indicators: Indicator[],
  relationships: Relationship[]
): string[] => {
  return useMemo(() => {
    // Return empty array if we don't have the required data
    if (!laggingDrivers || !thrivingDrivers || !indicators.length || !relationships.length) {
      return [];
    }

    const recommendations: string[] = [];
    
    if (laggingDrivers.length > 0) {
      // Find parent of the lowest scoring indicator
      const lowestIndicator = laggingDrivers[0];
      const parentRelation = relationships.find(rel => rel.child_id === lowestIndicator.indicator_id);
      const parentIndicator = parentRelation ? indicators.find(ind => ind.indicator_id === parentRelation.parent_id) : null;
      const parentName = parentIndicator?.name || 'overall performance';
      
      const laggingNames = laggingDrivers.map(d => d.name).join(', ');
      recommendations.push(`Focus on improving ${laggingNames} to boost ${parentName}.`);
    }
    
    if (thrivingDrivers.length > 0) {
      const thrivingNames = thrivingDrivers.map(d => d.name).join(', ');
      recommendations.push(`Continue to strengthen and maintain ${thrivingNames}.`);
    }
    
    if (laggingDrivers.length > 0) {
      // Pick 1-2 lagging drivers for targeted investment
      const targetDrivers = laggingDrivers.slice(0, 2);
      const driverDetails = targetDrivers.map(driver => {
        const snippet = driver.description 
          ? driver.description.split(' ').slice(0, 7).join(' ')
          : driver.name.toLowerCase();
        return `${driver.name} such as "${snippet}"`;
      }).join(' and ');
      
      recommendations.push(`Consider targeted investment in ${driverDetails} to address systemic challenges.`);
    }
    
    return recommendations;
  }, [laggingDrivers, thrivingDrivers, indicators, relationships]);
};

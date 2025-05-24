
import { useMemo } from 'react';
import { Indicator, Relationship, SunburstNode } from '@/types';

interface DriverResults {
  laggingDrivers: Indicator[];
  thrivingDrivers: Indicator[];
  visibleLinkedIndicators: Indicator[];
}

export const useDriverComputation = (
  coreIndicator: Indicator,
  indicators: Indicator[],
  relationships: Relationship[],
  visibleNodes: SunburstNode[]
): DriverResults => {
  return useMemo(() => {
    // Get set of visible node IDs for filtering
    const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
    
    // Traverse relationships to find linked indicators up to 3 levels deep
    const getLinkedIndicators = (startId: string, depth: number = 0, visited: Set<string> = new Set()): string[] => {
      if (depth >= 3 || visited.has(startId)) return [];
      
      visited.add(startId);
      const directChildren = relationships
        .filter(rel => rel.parent_id === startId && rel.child_id !== startId)
        .map(rel => rel.child_id);
      
      const allLinked = [...directChildren];
      
      // Recursively get children of children
      directChildren.forEach(childId => {
        allLinked.push(...getLinkedIndicators(childId, depth + 1, visited));
      });
      
      return allLinked;
    };
    
    // Get all linked indicator IDs starting from core indicator
    const linkedIds = getLinkedIndicators(coreIndicator.indicator_id);
    
    // Filter to only include indicators that are visible in the sunburst
    const visibleLinkedIndicators = indicators.filter(
      indicator => linkedIds.includes(indicator.indicator_id) && 
                  visibleNodeIds.has(indicator.indicator_id)
    );
    
    // Sort by current_value to get lagging and thriving drivers
    const sortedByValue = [...visibleLinkedIndicators].sort((a, b) => a.current_value - b.current_value);
    
    const laggingDrivers = sortedByValue.slice(0, 3);
    const thrivingDrivers = sortedByValue.slice(-3).reverse();
    
    return {
      laggingDrivers,
      thrivingDrivers,
      visibleLinkedIndicators
    };
  }, [coreIndicator, indicators, relationships, visibleNodes]);
};

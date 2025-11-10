
import { useMemo } from 'react';
import { Indicator, Relationship, SunburstNode } from '@/types';

interface DriverResults {
  laggingDrivers: Indicator[];
  thrivingDrivers: Indicator[];
  visibleLinkedIndicators: Indicator[];
}

export const useDriverComputation = (
  coreIndicator: Indicator | null,
  indicators: Indicator[],
  relationships: Relationship[],
  visibleNodes: SunburstNode[]
): DriverResults => {
  return useMemo(() => {
    // Return empty results if we don't have the required data
    if (!coreIndicator || !indicators.length || !relationships.length || !visibleNodes.length) {
      return {
        laggingDrivers: [],
        thrivingDrivers: [],
        visibleLinkedIndicators: []
      };
    }

    // Get set of visible node IDs for filtering
    const visibleNodeIds = new Set(visibleNodes.map(node => node.id));
      console.log("🚦 Driver hook input", {
        coreIndicator,
        visibleNodeIds: visibleNodes.map(v => v.id),
        indicators,
        relationships
      });
    
    // Traverse relationships to find linked indicators up to 3 levels deep
    const getLinkedIndicators = (startId: string, depth: number = 0, visited: Set<string> = new Set()): string[] => {
      if (depth >= 3 || visited.has(startId)) return [];
      
      visited.add(startId);
      const directChildren = relationships
        .filter(rel => rel.parent_indicator_id === startId && rel.child_indicator_id !== startId)
        .map(rel => rel.child_indicator_id);
      
      const allLinked = [...directChildren];
      
      // Recursively get children of children
      directChildren.forEach(childId => {
        allLinked.push(...getLinkedIndicators(childId, depth + 1, visited));
      });
      
      return allLinked;
    };
    
    // Get all linked indicator IDs starting from core indicator
    const linkedIds = getLinkedIndicators(coreIndicator.id);
    
    // Filter to only include indicators that are visible in the sunburst
    const visibleLinkedIndicators = indicators.filter(
      indicator => linkedIds.includes(indicator.id) && 
                  visibleNodeIds.has(indicator.id)
    );
    
    // Sort by id (as proxy for value since current_value doesn't exist anymore)
    const sortedByValue = [...visibleLinkedIndicators].sort((a, b) => a.id.localeCompare(b.id));
    
    const laggingDrivers = sortedByValue.slice(0, 3);
    const thrivingDrivers = sortedByValue.slice(-3).reverse();
    // Debug logs
    console.log('🔧 [useDriverComputation] core:', coreIndicator.id, 'visibleLinked:', visibleLinkedIndicators.map(i => i.id));
    console.log('🔧 [useDriverComputation] laggingDrivers:', laggingDrivers.map(d => d.id));
    console.log('🔧 [useDriverComputation] thrivingDrivers:', thrivingDrivers.map(d => d.id));
    return {
      laggingDrivers,
      thrivingDrivers,
      visibleLinkedIndicators
    };
  }, [coreIndicator, indicators, relationships, visibleNodes]);
};

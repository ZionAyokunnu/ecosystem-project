
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLocations } from '@/services/LocationApi';
import { Location } from '@/types';
import { MapPin, Globe } from 'lucide-react';

interface TargetLocationToggleProps {
  onLocationChange?: (location: Location | null) => void;
}

const TargetLocationToggle: React.FC<TargetLocationToggleProps> = ({ onLocationChange }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [isGlobal, setIsGlobal] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const fetchedLocations = await getLocations();
        const typedLocations = fetchedLocations.map(loc => ({
          ...loc,
          type: loc.type as 'country' | 'region' | 'city' | 'ward',
          parent_id: loc.parent_id || null
        }));
        setLocations(typedLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    loadLocations();
  }, []);

  const handleToggle = () => {
    if (isGlobal) {
      // Switch to first location
      setIsGlobal(false);
      setCurrentLocationIndex(0);
      if (locations.length > 0 && onLocationChange) {
        onLocationChange(locations[0]);
      }
    } else {
      // Cycle through locations or back to global
      const nextIndex = currentLocationIndex + 1;
      if (nextIndex >= locations.length) {
        setIsGlobal(true);
        if (onLocationChange) {
          onLocationChange(null);
        }
      } else {
        setCurrentLocationIndex(nextIndex);
        if (onLocationChange) {
          onLocationChange(locations[nextIndex]);
        }
      }
    }
  };

  const currentLocation = !isGlobal && locations[currentLocationIndex] ? locations[currentLocationIndex] : null;

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className="flex items-center gap-2 min-w-[120px]"
    >
      {isGlobal ? (
        <>
          <Globe className="w-4 h-4" />
          <span>Global</span>
        </>
      ) : (
        <>
          <MapPin className="w-4 h-4" />
          <span className="truncate max-w-[80px]">
            {currentLocation?.name || 'Location'}
          </span>
          <Badge variant="secondary" className="text-xs">
            {currentLocation?.type}
          </Badge>
        </>
      )}
    </Button>
  );
};

export default TargetLocationToggle;

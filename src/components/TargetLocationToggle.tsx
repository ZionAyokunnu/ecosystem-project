
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/context/LocationContext';
import { getRootLocations, getLocationChildren } from '@/services/locationApi';
import { Location } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';
import { getAllLocations } from '@/services/locationApi';

interface TargetLocationToggleProps {
  onLocationChange?: (location: Location | null) => void;
}

const TargetLocationToggle: React.FC<TargetLocationToggleProps> = ({ onLocationChange }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [isGlobal, setIsGlobal] = useState(true);
  const { selectedLocation, targetLocation, setTargetLocation } = useLocation();
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  
  useEffect(() => {
    const loadLocations = async () => {
      try {
        // Load all locations for comparison (simplified approach)
        const countries = await getRootLocations();
        let allLocations: Location[] = [...countries];
        const fetchedLocations = await getAllLocations();
        const typedLocations = fetchedLocations.map(loc => ({
          ...loc,
          type: loc.type as 'country' | 'region' | 'city' | 'ward',
          parent_id: loc.parent_id || null
        }));
        setLocations(typedLocations);

        // Load regions and cities for each country (simplified)
        for (const country of countries) {
          const regions = await getLocationChildren(country.location_id);
          allLocations = [...allLocations, ...regions];
          
          for (const region of regions) {
            const cities = await getLocationChildren(region.location_id);
            allLocations = [...allLocations, ...cities];
            
            for (const city of cities) {
              const wards = await getLocationChildren(city.location_id);
              allLocations = [...allLocations, ...wards];
            }
          }
        }
        
        // Filter out the currently selected location
        const filtered = allLocations.filter(
          loc => loc.location_id !== selectedLocation?.location_id
        );
        
        setAvailableLocations(filtered);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    loadLocations();
  }, [selectedLocation]);
  
  const handleTargetChange = (value: string) => {
    if (value === 'none') {
      setTargetLocation(null);
    } else {
      const location = availableLocations.find(loc => loc.location_id === value);
      setTargetLocation(location || null);
    }
  };
  
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
    <div> 
      <div className="flex items-center gap-3">
        <Label htmlFor="target-location" className="text-sm font-medium">
          Compare to:
        </Label>
        <Select
          value={targetLocation?.location_id || 'none'}
          onValueChange={handleTargetChange}
        >
          <SelectTrigger className="w-[200px]" id="target-location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None —</SelectItem>
            {availableLocations.map((location) => (
              <SelectItem key={location.location_id} value={location.location_id}>
                {location.name} ({location.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
};

export default TargetLocationToggle;

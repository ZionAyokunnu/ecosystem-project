
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/context/LocationContext';
import { getRootLocations, getLocationChildren } from '@/services/locationApi';
import { Location } from '@/types';
import { Label } from '@/components/ui/label';

const TargetLocationToggle: React.FC = () => {
  const { selectedLocation, targetLocation, setTargetLocation } = useLocation();
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  
  useEffect(() => {
    const loadLocations = async () => {
      try {
        // Load all locations for comparison (simplified approach)
        const countries = await getRootLocations();
        let allLocations: Location[] = [...countries];
        
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
  
  return (
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
  );
};

export default TargetLocationToggle;
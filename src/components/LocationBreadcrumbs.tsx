
import React, { useState, useEffect } from 'react';
import { useLocation } from '@/context/LocationContext';
import { getLocationPath } from '@/services/LocationApi';
import { LocationPath } from '@/services/LocationApi';
import { ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LocationBreadcrumbs: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const [breadcrumbPath, setBreadcrumbPath] = useState<LocationPath[]>([]);
  
  useEffect(() => {
    if (selectedLocation) {
      const loadPath = async () => {
        try {
          const path = await getLocationPath(selectedLocation.location_id);
          setBreadcrumbPath(path);
        } catch (error) {
          console.error('Error loading location path:', error);
        }
      };
      
      loadPath();
    } else {
      setBreadcrumbPath([]);
    }
  }, [selectedLocation]);
  
  const handleBreadcrumbClick = (locationId: string | null) => {
    if (locationId === null) {
      setSelectedLocation(null);
    } else {
      const location = breadcrumbPath.find(p => p.location_id === locationId);
      if (location) {
        setSelectedLocation({
          location_id: location.location_id,
          name: location.name,
          type: location.type as 'country' | 'region' | 'city' | 'ward',
          parent_id: null
        });
      }
    }
  };
  
  if (breadcrumbPath.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Globe className="w-4 h-4" />
        <span>Global View</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleBreadcrumbClick(null)}
        className="px-2 py-1 h-auto text-blue-600 hover:text-blue-800"
      >
        <Globe className="w-4 h-4 mr-1" />
        Global
      </Button>
      
      {breadcrumbPath.map((location, index) => (
        <React.Fragment key={location.location_id}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBreadcrumbClick(location.location_id)}
            className={`px-2 py-1 h-auto ${
              index === breadcrumbPath.length - 1
                ? 'text-gray-900 font-medium cursor-default'
                : 'text-blue-600 hover:text-blue-800'
            }`}
            disabled={index === breadcrumbPath.length - 1}
          >
            {location.name}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default LocationBreadcrumbs;

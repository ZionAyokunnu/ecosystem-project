
 import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Location, LocationContext as LocationContextType } from '../types';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [targetLocation, setTargetLocation] = useState<Location | null>(null);

  const value: LocationContextType = {
    selectedLocation,
    targetLocation,
    setSelectedLocation,
    setTargetLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
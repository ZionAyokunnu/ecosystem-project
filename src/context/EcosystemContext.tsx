
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Indicator, Relationship, UserSettings } from '@/types';
import { getIndicators, getRelationships } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface EcosystemContextProps {
  indicators: Indicator[];
  relationships: Relationship[];
  loading: boolean;
  error: Error | null;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  refreshData: () => Promise<void>;
}

const defaultUserSettings: UserSettings = {
  maxDrillDepth: 5,
  topDriversCount: 3,
  showPercentileDrivers: false,
  percentileThreshold: 95
};

const EcosystemContext = createContext<EcosystemContextProps | undefined>(undefined);

export const EcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [indicatorsData, relationshipsData] = await Promise.all([
        getIndicators(),
        getRelationships()
      ]);
      
      setIndicators(indicatorsData);
      setRelationships(relationshipsData);
    } catch (err) {
      console.error('Error fetching ecosystem data:', err);
      setError(err as Error);
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading the ecosystem data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...settings }));
    
    // Save to local storage
    const storedSettings = localStorage.getItem('ecosystemSettings');
    const currentSettings = storedSettings ? JSON.parse(storedSettings) : {};
    localStorage.setItem(
      'ecosystemSettings',
      JSON.stringify({ ...currentSettings, ...settings })
    );
  };
  
  useEffect(() => {
    // Load settings from local storage
    const storedSettings = localStorage.getItem('ecosystemSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setUserSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (err) {
        console.error('Error parsing stored settings:', err);
      }
    }
    
    // Initial data fetch
    refreshData();
  }, []);
  
  return (
    <EcosystemContext.Provider value={{
      indicators,
      relationships,
      loading,
      error,
      userSettings,
      updateUserSettings,
      refreshData
    }}>
      {children}
    </EcosystemContext.Provider>
  );
};

export const useEcosystem = () => {
  const context = useContext(EcosystemContext);
  if (context === undefined) {
    throw new Error('useEcosystem must be used within an EcosystemProvider');
  }
  return context;
};

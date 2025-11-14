import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@ecosystem/shared';
import { useOffline } from './OfflineStorage';

interface SyncManagerContextType {
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncTime: Date | null;
  pendingChanges: number;
  startSync: () => Promise<void>;
  enableAutoSync: (enabled: boolean) => void;
  autoSyncEnabled: boolean;
}

const SyncManagerContext = createContext<SyncManagerContextType | undefined>(undefined);

export function useSyncManager() {
  const context = useContext(SyncManagerContext);
  if (!context) {
    throw new Error('useSyncManager must be used within SyncManagerProvider');
  }
  return context;
}

export function SyncManagerProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [pendingChanges, setPendingChanges] = useState(0);
  
  const { user } = useAuth();
  const { isOnline, queuedActions, forcSync } = useOffline();

  useEffect(() => {
    setPendingChanges(queuedActions.length);
  }, [queuedActions]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && autoSyncEnabled && isOnline && pendingChanges > 0) {
        startSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [autoSyncEnabled, isOnline, pendingChanges]);

  useEffect(() => {
    if (autoSyncEnabled && isOnline) {
      const interval = setInterval(() => {
        if (pendingChanges > 0) {
          startSync();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoSyncEnabled, isOnline, pendingChanges]);

  const startSync = async () => {
    if (!isOnline || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');
    
    try {
      await syncUserProgress();
      await syncSurveyResponses();
      
      forcSync();
      
      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    }
  };

  const syncUserProgress = async () => {
    console.log('🔄 Syncing user progress...');
  };

  const syncSurveyResponses = async () => {
    console.log('🔄 Syncing survey responses...');
  };

  const enableAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
  };

  const value: SyncManagerContextType = {
    syncStatus,
    lastSyncTime,
    pendingChanges,
    startSync,
    enableAutoSync,
    autoSyncEnabled,
  };

  return (
    <SyncManagerContext.Provider value={value}>
      {children}
    </SyncManagerContext.Provider>
  );
}

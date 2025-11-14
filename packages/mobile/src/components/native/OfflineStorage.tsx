import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineContextType {
  isOnline: boolean;
  queuedActions: any[];
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  addToQueue: (action: any) => void;
  clearQueue: () => void;
  forcSync: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedActions, setQueuedActions] = useState<any[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    setupNetworkListener();
    loadQueuedActions();
  }, []);

  useEffect(() => {
    if (isOnline && queuedActions.length > 0 && !syncInProgress) {
      syncQueuedActions();
    }
  }, [isOnline, queuedActions, syncInProgress]);

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      setIsOnline(isNowOnline!);
      
      if (wasOffline && isNowOnline) {
        console.log('🌐 Back online! Starting sync...');
        syncQueuedActions();
      }
    });

    return unsubscribe;
  };

  const loadQueuedActions = async () => {
    try {
      const stored = await AsyncStorage.getItem('queued_actions');
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }

      const lastSync = await AsyncStorage.getItem('last_sync_time');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (error) {
      console.error('Error loading queued actions:', error);
    }
  };

  const addToQueue = async (action: any) => {
    const newAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    const updatedQueue = [...queuedActions, newAction];
    setQueuedActions(updatedQueue);
    
    try {
      await AsyncStorage.setItem('queued_actions', JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error saving queued action:', error);
    }
  };

  const clearQueue = async () => {
    setQueuedActions([]);
    try {
      await AsyncStorage.removeItem('queued_actions');
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  };

  const syncQueuedActions = async () => {
    if (!isOnline || syncInProgress || queuedActions.length === 0) return;

    setSyncInProgress(true);
    console.log(`🔄 Syncing ${queuedActions.length} offline actions...`);

    const succeededActions: string[] = [];
    const failedActions: any[] = [];

    for (const action of queuedActions) {
      try {
        await processAction(action);
        succeededActions.push(action.id);
        console.log(`✅ Synced: ${action.type}`);
      } catch (error) {
        console.error(`❌ Sync failed for ${action.type}:`, error);
        failedActions.push({
          ...action,
          retryCount: (action.retryCount || 0) + 1,
        });
      }
    }

    const filteredFailedActions = failedActions.filter(action => action.retryCount < 3);
    setQueuedActions(filteredFailedActions);
    
    try {
      await AsyncStorage.setItem('queued_actions', JSON.stringify(filteredFailedActions));
      await AsyncStorage.setItem('last_sync_time', new Date().toISOString());
      setLastSyncTime(new Date());
      
      console.log(`✅ Sync complete: ${succeededActions.length} succeeded, ${failedActions.length} failed`);
    } catch (error) {
      console.error('Error updating sync state:', error);
    }

    setSyncInProgress(false);
  };

  const processAction = async (action: any) => {
    switch (action.type) {
      case 'complete_survey':
        return await syncSurveyCompletion(action.data);
      case 'update_progress':
        return await syncProgressUpdate(action.data);
      case 'create_story':
        return await syncStoryCreation(action.data);
      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  const syncSurveyCompletion = async (data: any) => {
    console.log('Syncing survey completion:', data);
  };

  const syncProgressUpdate = async (data: any) => {
    console.log('Syncing progress update:', data);
  };

  const syncStoryCreation = async (data: any) => {
    console.log('Syncing story creation:', data);
  };

  const forcSync = () => {
    if (isOnline) {
      syncQueuedActions();
    }
  };

  const value: OfflineContextType = {
    isOnline,
    queuedActions,
    syncInProgress,
    lastSyncTime,
    addToQueue,
    clearQueue,
    forcSync,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

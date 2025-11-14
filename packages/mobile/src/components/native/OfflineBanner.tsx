import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useOffline } from './OfflineStorage';
import { useSyncManager } from './SyncManager';

export function OfflineBanner() {
  const { isOnline, queuedActions } = useOffline();
  const { syncStatus, startSync, pendingChanges } = useSyncManager();
  const [bannerHeight] = useState(new Animated.Value(0));
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const shouldShow = !isOnline || pendingChanges > 0;
    
    if (shouldShow && !showBanner) {
      setShowBanner(true);
      Animated.timing(bannerHeight, {
        toValue: 60,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else if (!shouldShow && showBanner) {
      Animated.timing(bannerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowBanner(false);
      });
    }
  }, [isOnline, pendingChanges, showBanner]);

  if (!showBanner) return null;

  const getBannerContent = () => {
    if (!isOnline) {
      return {
        emoji: '📱',
        title: 'Offline Mode',
        message: 'Keep learning! Your progress is saved locally.',
        color: 'bg-blue-500',
        action: null,
      };
    }

    if (pendingChanges > 0) {
      return {
        emoji: syncStatus === 'syncing' ? '🔄' : '☁️',
        title: syncStatus === 'syncing' ? 'Syncing...' : 'Ready to Sync',
        message: `${pendingChanges} change${pendingChanges > 1 ? 's' : ''} pending`,
        color: syncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-green-500',
        action: syncStatus !== 'syncing' ? (
          <Button
            size="sm"
            variant="outline"
            onPress={startSync}
            className="bg-white/20 border-white/30"
          >
            <Text className="text-white text-xs">Sync Now</Text>
          </Button>
        ) : null,
      };
    }

    return null;
  };

  const content = getBannerContent();
  if (!content) return null;

  return (
    <Animated.View 
      style={{ height: bannerHeight }}
      className={`${content.color} px-4 justify-center`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-white text-lg mr-2">{content.emoji}</Text>
          <View>
            <Text className="text-white font-medium text-sm">{content.title}</Text>
            <Text className="text-white/80 text-xs">{content.message}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center space-x-2">
          {pendingChanges > 0 && (
            <Badge className="bg-white/20">
              <Text className="text-white text-xs">{pendingChanges}</Text>
            </Badge>
          )}
          {content.action}
        </View>
      </View>
    </Animated.View>
  );
}

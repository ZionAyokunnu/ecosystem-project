import React, { createContext, useContext, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface NotificationOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationState extends NotificationOptions {
  id: string;
  visible: boolean;
  animatedValue: Animated.Value;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = (options: NotificationOptions) => {
    const id = Date.now().toString();
    const animatedValue = new Animated.Value(0);
    
    const notification: NotificationState = {
      ...options,
      id,
      visible: true,
      animatedValue
    };

    setNotifications(prev => [...prev, notification]);

    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();

    const duration = options.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
  };

  const hideNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      Animated.timing(notification.animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      });
    }
  };

  const getNotificationStyle = (variant: NotificationOptions['variant']) => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'destructive':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationTextStyle = (variant: NotificationOptions['variant']) => {
    switch (variant) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'destructive':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      <View className="absolute top-12 left-4 right-4 z-50 pointer-events-none">
        {notifications.map((notification) => (
          <Animated.View
            key={notification.id}
            style={{
              transform: [
                {
                  translateY: notification.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
                {
                  scale: notification.animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              opacity: notification.animatedValue,
            }}
            className="mb-3 pointer-events-auto"
          >
            <Pressable
              onPress={() => hideNotification(notification.id)}
              className={cn(
                "p-4 rounded-lg border shadow-lg",
                getNotificationStyle(notification.variant)
              )}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className={cn(
                    "font-semibold",
                    getNotificationTextStyle(notification.variant)
                  )}>
                    {notification.title}
                  </Text>
                  {notification.description && (
                    <Text className={cn(
                      "text-sm mt-1",
                      getNotificationTextStyle(notification.variant)
                    )}>
                      {notification.description}
                    </Text>
                  )}
                </View>
                
                {notification.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      notification.action!.onPress();
                      hideNotification(notification.id);
                    }}
                    className="ml-2"
                  >
                    {notification.action.label}
                  </Button>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </NotificationContext.Provider>
  );
}

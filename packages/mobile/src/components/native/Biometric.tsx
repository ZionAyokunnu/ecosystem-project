import React, { useState, useEffect } from 'react';
import { View, Alert, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Switch } from '@/src/components/ui/Switch';
import { useAuth } from '@ecosystem/shared';

interface BiometricAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  fallbackToPassword?: boolean;
}

export function BiometricAuth({ 
  onSuccess, 
  onError, 
  fallbackToPassword = true 
}: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    checkBiometricSettings();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsSupported(hasHardware && isEnrolled);

      let type = 'Biometric';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        type = Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        type = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      }
      setBiometricType(type);

    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  const checkBiometricSettings = async () => {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      setIsEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking biometric settings:', error);
    }
  };

  const authenticate = async () => {
    if (!isSupported) {
      onError?.('Biometric authentication is not available');
      return;
    }

    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${biometricType}`,
        cancelLabel: 'Cancel',
        fallbackLabel: fallbackToPassword ? 'Use Password' : undefined,
        disableDeviceFallback: !fallbackToPassword,
      });

      if (result.success) {
        onSuccess?.();
      } else if (result.error === 'UserFallback' && fallbackToPassword) {
        onError?.('fallback_to_password');
      } else {
        onError?.(result.error || 'Authentication failed');
      }

    } catch (error) {
      onError?.(`Authentication error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBiometric = async (enabled: boolean) => {
    if (enabled && !isSupported) {
      Alert.alert(
        'Not Available',
        `${biometricType} is not set up on this device. Please set it up in Settings first.`
      );
      return;
    }

    if (enabled) {
      setLoading(true);
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Enable ${biometricType}?`,
          cancelLabel: 'Cancel',
        });

        if (result.success) {
          await SecureStore.setItemAsync('biometric_enabled', 'true');
          setIsEnabled(true);
          Alert.alert('Success', `${biometricType} authentication enabled`);
        }
      } catch (error) {
        console.error('Error enabling biometric:', error);
      } finally {
        setLoading(false);
      }
    } else {
      await SecureStore.setItemAsync('biometric_enabled', 'false');
      setIsEnabled(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-6">
        <Text className="text-center text-gray-500">
          {biometricType} is not available on this device
        </Text>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold">{biometricType}</Text>
          <Text className="text-sm text-gray-600">
            Use {biometricType.toLowerCase()} to unlock the app
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={toggleBiometric}
          disabled={loading}
        />
      </View>

      {isEnabled && (
        <Button
          onPress={authenticate}
          disabled={loading}
          className="mt-4"
        >
          {loading ? 'Authenticating...' : `Test ${biometricType}`}
        </Button>
      )}
    </Card>
  );
}

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { Text } from '@/src/components/ui/Text';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      Alert.alert('Login Error', error.message);
    }
    
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !firstName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, firstName);
    
    if (error) {
      Alert.alert('Signup Error', error.message);
    } else {
      Alert.alert('Success', 'Please check your email to confirm your account');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4">
          <View className="flex-1 justify-center py-12">
            <Card className="p-6">
              <Text className="text-3xl font-bold text-center mb-2">
                Community Ecosystem Platform
              </Text>
              <Text className="text-muted-foreground text-center mb-8">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Text>

              <View className="gap-4">
                {isSignUp && (
                  <Input
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                )}
                
                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Button
                  onPress={isSignUp ? handleSignUp : handleSignIn}
                  disabled={loading}
                  className="mt-6"
                >
                  {loading 
                    ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                    : (isSignUp ? 'Sign Up' : 'Sign In')
                  }
                </Button>

                <Button
                  variant="ghost"
                  onPress={() => setIsSignUp(!isSignUp)}
                  className="mt-4"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : 'Need an account? Sign Up'
                  }
                </Button>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

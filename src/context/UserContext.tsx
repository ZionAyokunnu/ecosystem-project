
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  userProfile: UserProfile | null;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: '',
  role: 'resident',
  location_id: '',
  hasCompletedOnboarding: false
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadUserProfile = async () => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
        // setUserProfile(DEFAULT_PROFILE);
      }
    } else {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setUserProfile({
            ...DEFAULT_PROFILE,
            id: user.id, // ✅ Set real UUID from Supabase
            name: user.user_metadata?.name || '',
          });
        } else {
          setUserProfile(DEFAULT_PROFILE);
        }
      } catch (error) {
        console.error('Error fetching user from Supabase:', error);
        setUserProfile(DEFAULT_PROFILE);
      }
    }
  };
  loadUserProfile();
  }, []);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : { ...DEFAULT_PROFILE, ...updates });
  };

  const setOnboardingComplete = (complete: boolean) => {
    updateProfile({ hasCompletedOnboarding: complete });
  };

  const isOnboardingComplete = userProfile?.hasCompletedOnboarding || false;

  return (
    <UserContext.Provider value={{
      userProfile,
      updateProfile,
      isOnboardingComplete,
      setOnboardingComplete
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

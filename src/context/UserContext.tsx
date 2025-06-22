
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
      let parsedSaved = null;
      if (saved) {
        try {
          parsedSaved = JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved profile:', error);
        }
      }
      if (parsedSaved && parsedSaved.id) {
        console.log('UserContext: Using saved profile with id', parsedSaved.id);
        setUserProfile(parsedSaved);
      } else {
        console.log('UserContext: Fetching profile from Supabase');
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          if (user) {
            // Fetch extended profile data from public.profiles
            const { data: dbProfile, error: dbError } = await supabase
              .from('profiles')
              .select('first_name, role, location_id, has_completed_onboarding')
              .eq('id', user.id)
              .single();
            if (dbError) {
              console.error('UserContext: Error fetching profile from DB:', dbError);
            }
            const newProfile: UserProfile = {
              ...DEFAULT_PROFILE,
              id: user.id,
              name: dbProfile?.first_name || user.user_metadata?.name || '',
              role: dbProfile?.role || parsedSaved?.role || DEFAULT_PROFILE.role,
              location_id: dbProfile?.location_id || parsedSaved?.location_id || DEFAULT_PROFILE.location_id,
              hasCompletedOnboarding: dbProfile?.has_completed_onboarding ?? parsedSaved?.hasCompletedOnboarding ?? DEFAULT_PROFILE.hasCompletedOnboarding
            };
            console.log('UserContext: Fetched userProfile', newProfile);
            setUserProfile(newProfile);
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

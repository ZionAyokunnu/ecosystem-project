
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

const SKIP_ONBOARDING = true; // 🔧 Set to false in production

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userProfile, isOnboardingComplete } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Allow access to onboarding, profile, and homepage without restrictions
    const allowedPaths = ['/onboarding', '/profile', '/'];
    const isAllowedPath = allowedPaths.includes(location.pathname);

    if (SKIP_ONBOARDING) return;

    if (!userProfile) {
      // Still loading profile
      return;
    }

    // If user hasn't completed onboarding and isn't on an allowed path, redirect to onboarding
    if (!isOnboardingComplete && !isAllowedPath) {
      navigate('/onboarding');
      return;
    }

    // Admin users can access everything
    if (userProfile.role === 'admin') {
      return;
    }

    // Non-admin users with completed onboarding can access all features
    if (isOnboardingComplete) {
      return;
    }
  }, [userProfile, isOnboardingComplete, location.pathname, navigate]);

  // Show loading while profile is being loaded
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Allow access if onboarding is complete or user is admin or on allowed path or SKIP_ONBOARDING
  const allowedPaths = ['/onboarding', '/profile', '/'];
  const isAllowedPath = allowedPaths.includes(location.pathname);
  
  if (isOnboardingComplete || userProfile.role === 'admin' || SKIP_ONBOARDING || isAllowedPath) {
    return <>{children}</>;
  }

  // Redirect to onboarding will happen in useEffect
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Complete Your Onboarding</h2>
        <p className="text-gray-600">Please complete the onboarding survey to access this feature.</p>
      </div>
    </div>
  );
};

export default ProtectedRoute;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Brain, User, Trophy } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/path', icon: Home, label: 'Learning' },
    { path: '/insights', icon: Brain, label: 'Insights' },
    { path: '/wallet', icon: Trophy, label: 'Rewards' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-success bg-success/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

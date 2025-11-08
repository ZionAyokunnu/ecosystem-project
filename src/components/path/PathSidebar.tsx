import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  color: string;
}

const navigationItems: NavItem[] = [
  { 
    icon: '🏠', 
    label: 'LEARN', 
    route: '/path',
    color: 'hsl(var(--success))'
  },
  { 
    icon: '📋', 
    label: 'INSIGHTS', 
    route: '/overview',
    color: 'hsl(var(--muted-foreground))'
  },
  { 
    icon: '🏆', 
    label: 'LEADERBOARDS', 
    route: '/leaderboard',
    color: 'hsl(var(--muted-foreground))'
  },
  { 
    icon: '🎯', 
    label: 'ACHIEVEMENTS', 
    route: '/wallet',
    color: 'hsl(var(--muted-foreground))'
  },
  { 
    icon: '👤', 
    label: 'PROFILE', 
    route: '/profile',
    color: 'hsl(var(--muted-foreground))'
  }
];

export const PathSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (route: string) => location.pathname === route;

  return (
    <aside className="w-[160px] h-screen sticky top-0 bg-background border-r border-border py-5">
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.route);
          
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`
                w-[140px] h-12 mx-2.5 mb-1 px-4 rounded-xl
                flex items-center gap-2
                font-medium text-sm
                transition-all duration-200
                ${active 
                  ? 'bg-success-bg border border-success text-success' 
                  : 'bg-transparent border-0 text-muted-foreground hover:bg-muted'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

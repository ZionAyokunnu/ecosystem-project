
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Settings, Trophy, Wallet, BarChart3, FileText, Home, MessageSquare, TreePine, PieChart } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleDashboard = () => {
    if (!profile) return '/dashboard';
    
    switch (profile.role) {
      case 'admin':
        return '/dashboard';
      case 'community_rep':
        return '/dashboard';
      case 'researcher':
        return 'dashboard';
      default:
        return '/dashboard';
    }
  };
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/overview', label: 'Overview', icon: BarChart3 },
    { path: '/stories', label: 'Stories', icon: MessageSquare },
    { path: '/surveys', label: 'Surveys', icon: FileText },
    { path: '/detail', label: 'Insight', icon: PieChart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-black-600" />
            <span className="font-bold text-xl text-gray-900">Ecosystem</span>
          </Link>
          
          {/*<nav className="hidden md:flex space-x-6">
             <Link to="/" className="text-gray-600 hover:text-gray-600">
              Initial Home
            </Link>
            <Link to="/home" className="text-gray-600 hover:text-gray-600">
              New Landing
            </Link>
            <Link to="/stories" className="text-gray-600 hover:text-gray-600">
              Stories & Calls
            </Link>
            <Link to="/detail" className="text-gray-600 hover:text-gray-600">
              Data & Insights
            </Link> */}

            <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-gray-600 bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          </nav>

          <div className="flex items-center space-x-4">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    {/* <span>{profile.first_name}</span> */}
                    <span className="hidden sm:inline">{profile.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(getRoleDashboard())}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/wallet')}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/leaderboard')}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Leaderboard
                  </DropdownMenuItem>
                  
                  {(profile.role === 'community_rep' || profile.role === 'admin') &&  (
                    <DropdownMenuItem onClick={() => navigate('/rep-dashboard')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Rep Dashboard
                    </DropdownMenuItem>
                  )}
                  
                  {profile.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}

                  {(profile.role === 'researcher' || profile.role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/researcher/insights')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Research Panel
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

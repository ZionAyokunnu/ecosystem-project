
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Settings, Trophy, Wallet } from 'lucide-react';

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

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/overview" className="text-xl font-bold text-blue-600">
            Community Ecosystem
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/overview" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <Link to="/stories" className="text-gray-600 hover:text-blue-600">
              Stories & Calls
            </Link>
            <Link to="/detail" className="text-gray-600 hover:text-blue-600">
              Data & Insights
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{profile.first_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(getRoleDashboard())}>
                    <Settings className="w-4 h-4 mr-2" />
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
                      <Settings className="w-4 h-4 mr-2" />
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

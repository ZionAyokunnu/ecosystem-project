
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SettingsDialog from '@/components/SettingsDialog';
import { Cog, Home, BarChart2, Activity, Clock } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Ecosystem</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/">
              <Button variant={isActive('/') ? "default" : "ghost"} className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Overview</span>
              </Button>
            </Link>
            <Link to="/profiles">
              <Button variant={isActive('/profiles') ? "default" : "ghost"} className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Profiles</span>
              </Button>
            </Link>
            
            <SettingsDialog 
              trigger={
                <Button variant="outline" size="icon">
                  <Cog className="h-4 w-4" />
                </Button>
              } 
            />
          </nav>
          
          <div className="md:hidden">
            <SettingsDialog 
              trigger={
                <Button variant="outline" size="icon">
                  <Cog className="h-4 w-4" />
                </Button>
              } 
            />
          </div>
        </div>
        
        {/* Mobile nav */}
        <div className="md:hidden border-t pt-2 pb-3">
          <div className="flex justify-around">
            <Link to="/" className={`flex flex-col items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}>
              <Home className="h-5 w-5" />
              <span>Overview</span>
            </Link>
            <Link to="/profiles" className={`flex flex-col items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/profiles') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}>
              <Clock className="h-5 w-5" />
              <span>Profiles</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

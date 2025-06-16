
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

interface SunburstFixModeToggleProps {
  fixMode: boolean;
  onToggle: () => void;
}

const SunburstFixModeToggle: React.FC<SunburstFixModeToggleProps> = ({ fixMode, onToggle }) => {
  return (
    <Button
      variant={fixMode ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      {fixMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      {fixMode ? 'Fix Mode On' : 'Fix Mode Off'}
    </Button>
  );
};

export default SunburstFixModeToggle;

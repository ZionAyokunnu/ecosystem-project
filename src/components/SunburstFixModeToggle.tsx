
import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SunburstFixModeToggleProps {
  isFixed: boolean;
  onToggle: (fixed: boolean) => void;
}

const SunburstFixModeToggle: React.FC<SunburstFixModeToggleProps> = ({
  isFixed,
  onToggle
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border">
      <Button
        variant={isFixed ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle(!isFixed)}
        className="flex items-center gap-2"
      >
        {isFixed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        {isFixed ? 'Fixed Mode' : 'Drill Mode'}
      </Button>
      <Badge variant={isFixed ? "destructive" : "secondary"} className="text-xs">
        {isFixed ? 'Click for Simulation' : 'Click to Drill Down'}
      </Badge>
    </div>
  );
};

export default SunburstFixModeToggle;
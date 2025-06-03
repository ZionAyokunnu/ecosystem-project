
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SunburstFixModeToggleProps {
  isFixedMode: boolean;
  onToggle: (enabled: boolean) => void;
}

const SunburstFixModeToggle: React.FC<SunburstFixModeToggleProps> = ({
  isFixedMode,
  onToggle
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg border bg-white shadow-sm">
      {isFixedMode ? (
        <Lock className="w-4 h-4 text-blue-600" />
      ) : (
        <Unlock className="w-4 h-4 text-gray-400" />
      )}
      <Label 
        htmlFor="fix-mode-toggle" 
        className={`text-sm font-medium cursor-pointer ${
          isFixedMode ? 'text-blue-900' : 'text-gray-600'
        }`}
      >
        {isFixedMode ? 'Fixed Mode ON' : 'Fix Mode'}
      </Label>
      <Switch
        id="fix-mode-toggle"
        checked={isFixedMode}
        onCheckedChange={onToggle}
        className={isFixedMode ? 'data-[state=checked]:bg-blue-600' : ''}
      />
      {isFixedMode && (
        <div className="text-xs text-blue-700 ml-2 max-w-48">
          Click slices to simulate changes
        </div>
      )}
    </div>
  );
};

export default SunburstFixModeToggle;

import React, { useState } from 'react';
import { useEcosystem } from '@/context/EcosystemContext';
import { UserSettings } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsDialogProps {
  trigger: React.ReactNode;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ trigger }) => {
  const { userSettings, updateUserSettings } = useEcosystem();
  const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);
  const [open, setOpen] = useState(false);
  
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSettings(userSettings);
    }
    setOpen(isOpen);
  };
  
  const handleSave = () => {
    updateUserSettings(localSettings);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Customize how the ecosystem visualization and analysis works.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxDepth" className="text-right">
              Max Drill Depth
            </Label>
            <div className="col-span-3">
              <Input
                id="maxDepth"
                type="number"
                min={3}
                max={6}
                value={localSettings.maxDrillDepth}
                onChange={(e) => 
                  setLocalSettings({ 
                    ...localSettings, 
                    maxDrillDepth: Math.min(6, Math.max(3, parseInt(e.target.value) || 3)) 
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Set visualization depth (3-6)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topDrivers" className="text-right">
              Top Drivers
            </Label>
            <div className="col-span-3">
              <Input
                id="topDrivers"
                type="number"
                min={1}
                max={10}
                value={localSettings.topDriversCount}
                onChange={(e) => 
                  setLocalSettings({ 
                    ...localSettings, 
                    topDriversCount: Math.min(10, Math.max(1, parseInt(e.target.value) || 3)) 
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Number of top drivers to show</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usePercentile" className="text-right">
              Use Percentile
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="usePercentile"
                checked={localSettings.showPercentileDrivers}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, showPercentileDrivers: checked })
                }
              />
              <span className="ml-2 text-sm text-gray-700">
                Show drivers above percentile threshold
              </span>
            </div>
          </div>
          
          {localSettings.showPercentileDrivers && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="percentile" className="text-right">
                Percentile: {localSettings.percentileThreshold}%
              </Label>
              <div className="col-span-3">
                <Slider
                  id="percentile"
                  min={80}
                  max={99}
                  step={1}
                  value={[localSettings.percentileThreshold]}
                  onValueChange={(value) => 
                    setLocalSettings({ ...localSettings, percentileThreshold: value[0] })
                  }
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

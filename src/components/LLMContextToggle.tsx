
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LLMContextToggleProps {
  mode: 'business' | 'community';
  onModeChange: (mode: 'business' | 'community') => void;
}

const LLMContextToggle: React.FC<LLMContextToggleProps> = ({
  mode,
  onModeChange
}) => {
  // Load saved preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('llmMode') as 'business' | 'community';
    if (savedMode && (savedMode === 'business' || savedMode === 'community')) {
      onModeChange(savedMode);
    }
  }, [onModeChange]);

  // Save preference to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('llmMode', mode);
  }, [mode]);

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="llm-mode" className="text-white text-sm">
        Perspective:
      </Label>
      <Select value={mode} onValueChange={onModeChange}>
        <SelectTrigger 
          id="llm-mode"
          className="w-32 bg-white/10 border-white/20 text-white focus:ring-white/50"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="community">Community</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LLMContextToggle;
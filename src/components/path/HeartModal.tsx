import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPracticeMode: () => void;
}

export const HeartModal: React.FC<HeartModalProps> = ({ isOpen, onClose, onPracticeMode }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="w-20 h-20 text-destructive fill-destructive opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">0</span>
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Out of Hearts</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            You've run out of hearts for today. Come back tomorrow for a fresh start, or practice without losing hearts!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={onPracticeMode}
            variant="default"
            className="w-full h-12 text-base"
          >
            <Zap className="w-5 h-5 mr-2" />
            Practice Mode
          </Button>
          
          <Button
            onClick={() => navigate('/path')}
            variant="outline"
            className="w-full h-12 text-base"
          >
            Back to Path
          </Button>
        </div>

        <div className="pt-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 fill-destructive text-destructive" />
            Hearts refill daily at midnight
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Flame, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitNumber: number;
  insightsEarned: number;
  isCheckpoint: boolean;
  newBadges?: string[];
  onViewInsights?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  unitNumber,
  insightsEarned,
  isCheckpoint,
  newBadges = [],
  onViewInsights
}) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && isCheckpoint) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen, isCheckpoint]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden">
        {/* Confetti effect for checkpoints */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][
                      Math.floor(Math.random() * 5)
                    ]
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="text-center space-y-6 py-6 relative z-10">
          {/* Icon and title */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`p-6 rounded-full ${isCheckpoint ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-purple-500'} animate-scale-in`}>
                {isCheckpoint ? (
                  <Trophy className="w-16 h-16 text-white" />
                ) : (
                  <Star className="w-16 h-16 text-white" />
                )}
              </div>
              {isCheckpoint && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">
              {isCheckpoint ? '🎉 Checkpoint Complete!' : '✅ Unit Complete!'}
            </h2>
            <p className="text-lg text-muted-foreground">
              Unit {unitNumber} • {insightsEarned} Insights Earned
            </p>
          </div>

          {/* New badges earned */}
          {newBadges.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <Zap className="w-4 h-4" />
                New Badges Unlocked
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {newBadges.map((badge, i) => (
                  <div
                    key={badge}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium animate-scale-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkpoint bonus message */}
          {isCheckpoint && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg animate-fade-in">
              <p className="text-sm font-medium text-orange-800">
                🎁 Checkpoint Bonus: +20 Extra Insights!
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => {
                onClose();
                navigate('/path');
              }}
              className="w-full h-12 text-base"
            >
              🚀 Continue Learning
            </Button>
            {onViewInsights && (
              <Button
                onClick={() => {
                  onViewInsights();
                  onClose();
                }}
                variant="outline"
                className="w-full h-12 text-base border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <span className="mr-2">🧠</span>
                See Your Impact
              </Button>
            )}
            <Button
              onClick={() => {
                onClose();
                navigate('/profile');
              }}
              variant="outline"
              className="w-full h-12 text-base"
            >
              View All Badges
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          .animate-fall {
            animation: fall linear forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

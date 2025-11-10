import React from 'react';

interface Milestone {
  target: number;
  current: number;
  progress: number;
  reward: string;
}

interface ProgressMilestoneProps {
  milestone: Milestone;
}

export const ProgressMilestone: React.FC<ProgressMilestoneProps> = ({ milestone }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h3 className="font-bold text-foreground">Next Milestone</h3>
            <p className="text-muted-foreground text-sm">{milestone.current} / {milestone.target} insights</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-purple-600">{milestone.reward}</div>
          <div className="text-sm text-muted-foreground">{milestone.target - milestone.current} more needed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-muted rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${milestone.progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          </div>
        </div>
        
        {/* Milestone markers */}
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">{milestone.current}</span>
          <span className="text-xs font-medium text-purple-600">{milestone.target}</span>
        </div>
      </div>
    </div>
  );
};

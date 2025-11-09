import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PathNodeProps {
  id: string;
  node_type: 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';
  status: 'locked' | 'available' | 'current' | 'completed';
  title: string;
  sequence_day: number;
  estimated_minutes: number;
  isCheckpoint?: boolean;
}

export const PathNode: React.FC<PathNodeProps> = ({
  id,
  node_type,
  status,
  title,
  sequence_day,
  estimated_minutes,
  isCheckpoint
}) => {
  const navigate = useNavigate();

  const nodeStyles = {
    locked: {
      background: 'hsl(var(--muted))',
      border: '4px solid hsl(var(--border))',
      icon: '🔒',
      iconColor: 'hsl(var(--muted-foreground))',
      clickable: false,
      glow: false
    },
    available: {
      background: 'hsl(var(--background))',
      border: '4px solid hsl(var(--border))',
      icon: '📍',
      iconColor: 'hsl(var(--muted-foreground))',
      clickable: true,
      glow: false
    },
    current: {
      background: 'hsl(var(--success))',
      border: '4px solid hsl(var(--success-hover))',
      icon: '⭐',
      iconColor: 'hsl(var(--success-foreground))',
      clickable: true,
      glow: true
    },
    completed: {
      background: 'hsl(220, 90%, 56%)',
      border: '4px solid hsl(220, 90%, 46%)',
      icon: '👑',
      iconColor: '#FFFFFF',
      clickable: true,
      glow: false
    }
  };

  const style = isCheckpoint && status === 'completed' 
    ? {
        background: 'hsl(270, 70%, 60%)',
        border: '4px solid hsl(270, 70%, 50%)',
        icon: '💎',
        iconColor: '#FFFFFF',
        clickable: true,
        glow: false
      }
    : nodeStyles[status];

  const handleClick = () => {
    if (status === 'locked') return;
    navigate(`/unit-survey?nodeId=${id}&type=${node_type}`);
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* The node circle */}
      <button
        onClick={handleClick}
        disabled={!style.clickable}
        className={`
          relative w-14 h-14 rounded-full
          flex items-center justify-center
          text-2xl font-bold
          transition-all duration-200
          z-10
          ${style.clickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
          ${style.glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}
        `}
        style={{
          background: style.background,
          border: style.border,
          color: style.iconColor
        }}
      >
        {style.icon}
      </button>

      {/* Title label */}
      <div 
        className="absolute left-[80px] bg-background border border-border rounded-lg px-4 py-2 shadow-sm"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-sm font-medium text-foreground whitespace-nowrap">
          {title}
        </div>
      </div>

      {/* START button for current node */}
      {status === 'current' && (
        <button
          onClick={handleClick}
          className="absolute -top-[50px] left-1/2 -translate-x-1/2
            w-[120px] h-10 rounded-full
            bg-gradient-to-r from-success to-success-light
            text-white font-bold text-sm
            flex items-center justify-center gap-2
            shadow-lg hover:shadow-xl
            transition-all duration-200
            animate-pulse"
        >
          <span className="text-base">⚡</span>
          START
        </button>
      )}

      {/* JUMP button for available nodes above current */}
      {status === 'available' && sequence_day > 2 && (
        <button
          onClick={handleClick}
          className="absolute -bottom-[45px] left-1/2 -translate-x-1/2
            w-[140px] h-9 rounded-full
            bg-gradient-to-r from-purple-500 to-purple-600
            text-white font-bold text-xs
            flex items-center justify-center gap-1.5
            shadow-md hover:shadow-lg
            transition-all duration-200
            animate-bounce"
          style={{ animationDuration: '1.5s' }}
        >
          <span className="text-sm">🚀</span>
          JUMP HERE?
        </button>
      )}
    </div>
  );
};

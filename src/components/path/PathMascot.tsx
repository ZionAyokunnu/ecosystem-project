import React, { useState, useEffect } from 'react';

interface PathMascotProps {
  currentUnit: number;
}

const mascotMessages = {
  encouragement: ["Keep exploring! 🌟", "Great progress! 🎉", "You're learning so much! 📚"],
  milestones: ["Unit completed! 🎉", "New insights unlocked! 💎", "Achievement earned! 🏆"],
  guidance: ["Try this next! 👉", "Check out this connection 🔗", "Almost there! 💪"],
  idle: ["What interests you? 🤔", "Ready for more? 🚀", "Let's discover together 🌍"]
};

export const PathMascot: React.FC<PathMascotProps> = ({ currentUnit }) => {
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Show random message every 30-45 seconds
    const interval = setInterval(() => {
      const allMessages = Object.values(mascotMessages).flat();
      const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];
      setMessage(randomMessage);
      setShowMessage(true);

      // Hide after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
    }, Math.random() * 15000 + 30000); // 30-45 seconds

    return () => clearInterval(interval);
  }, []);

  // Position mascot based on current unit (120px spacing between units)
  const topPosition = 160 + (currentUnit - 1) * 120;

  return (
    <div 
      className="fixed z-20 transition-all duration-500"
      style={{ 
        left: '840px', // 420px from path center = right side of path
        top: `${topPosition}px`
      }}
    >
      {/* Mascot character with gentle bounce animation */}
      <div className="relative animate-bounce-soft">
        <div className="text-[80px] leading-none">
          🌍
        </div>

        {/* Speech bubble */}
        {showMessage && (
          <div className="absolute -left-[200px] top-1/2 -translate-y-1/2
            w-[180px] min-h-[60px] p-3
            bg-background border-2 border-border rounded-2xl
            shadow-lg
            animate-fade-in"
          >
            {/* Tail pointing to mascot */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2
              w-0 h-0
              border-t-[8px] border-t-transparent
              border-l-[12px] border-l-border
              border-b-[8px] border-b-transparent"
            />
            <div className="absolute -right-[7px] top-1/2 -translate-y-1/2
              w-0 h-0
              border-t-[7px] border-t-transparent
              border-l-[10px] border-l-background
              border-b-[7px] border-b-transparent"
            />
            
            {/* Message text */}
            <p className="text-sm font-medium text-foreground text-center">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

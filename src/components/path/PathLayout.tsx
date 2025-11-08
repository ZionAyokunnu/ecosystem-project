import React from 'react';
import { PathSidebar } from './PathSidebar';
import { PathProgress } from './PathProgress';
import { QuestPanel } from './QuestPanel';
import { StatsHeader } from './StatsHeader';

interface PathLayoutProps {
  children?: React.ReactNode;
}

export const PathLayout: React.FC<PathLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Stats header - fixed at top right */}
      <StatsHeader />
      
      {/* Main layout grid */}
      <div className="flex w-full max-w-[1100px] mx-auto">
        {/* Left sidebar - 160px */}
        <PathSidebar />
        
        {/* Center content - 600px */}
        <main className="w-[600px] bg-muted/30">
          {children || <PathProgress />}
        </main>
        
        {/* Right rail - 300px */}
        <aside className="w-[300px] p-5">
          <QuestPanel />
        </aside>
        
        {/* Far right margin - 40px */}
        <div className="w-[40px]" />
      </div>
    </div>
  );
};

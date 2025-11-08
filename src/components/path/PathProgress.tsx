import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PathNode } from './PathNode';
import { PathMascot } from './PathMascot';

interface UnitNode {
  unitId: string;
  status: 'locked' | 'available' | 'current' | 'completed';
  title: string;
  position: number;
  isCheckpoint?: boolean;
}

export const PathProgress: React.FC = () => {
  const [units, setUnits] = useState<UnitNode[]>([]);
  const [currentUnit, setCurrentUnit] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPathProgress();
  }, []);

  const loadPathProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's path progress
      const { data: progress } = await supabase
        .from('path_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('unit_id');

      // Fetch user's domain to customize titles
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_domain')
        .eq('id', user.id)
        .single();

      // Generate unit titles based on domain
      const generateUnitTitle = (unitNum: number, domain: string) => {
        const titles = {
          environment: [
            'Green Spaces Impact',
            'Climate & Community',
            'Sustainable Living',
            'Biodiversity Basics',
            'Environmental Justice'
          ],
          social: [
            'Community Bonds',
            'Cultural Diversity',
            'Social Networks',
            'Inclusion & Belonging',
            'Civic Engagement'
          ],
          economy: [
            'Local Business Impact',
            'Employment Trends',
            'Economic Mobility',
            'Housing & Affordability',
            'Innovation Hubs'
          ],
          health: [
            'Health Access',
            'Mental Wellbeing',
            'Active Lifestyles',
            'Community Wellness',
            'Healthcare Equity'
          ],
          education: [
            'Learning Opportunities',
            'Skill Development',
            'Digital Literacy',
            'Career Pathways',
            'Educational Equity'
          ],
          explore: [
            'System Connections',
            'Data Patterns',
            'Complex Relationships',
            'Research Methods',
            'Ecosystem Thinking'
          ]
        };

        const domainTitles = titles[domain as keyof typeof titles] || titles.explore;
        return domainTitles[unitNum - 1] || `Unit ${unitNum}`;
      };

      // Build units array (showing 10 units)
      const unitsData: UnitNode[] = Array.from({ length: 10 }, (_, i) => {
        const unitNum = i + 1;
        const unitProgress = progress?.find(p => p.unit_id === `unit_${unitNum}`);
        
        return {
          unitId: `unit_${unitNum}`,
          status: (unitProgress?.status as UnitNode['status']) || 'locked',
          title: generateUnitTitle(unitNum, profile?.selected_domain || 'explore'),
          position: i,
          isCheckpoint: unitNum % 5 === 0 // Every 5th unit is a checkpoint
        };
      });

      setUnits(unitsData);
      
      // Find current unit
      const current = unitsData.find(u => u.status === 'current');
      if (current) {
        setCurrentUnit(parseInt(current.unitId.split('_')[1]));
      }
      
    } catch (error) {
      console.error('Error loading path progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading your path...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-10 px-[60px]">
      {/* Current unit banner */}
      <div className="w-[480px] h-16 mb-12 rounded-2xl bg-gradient-to-br from-success to-success-light p-4 flex items-center justify-between animate-scale-in">
        <div>
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">
            Section 1, Unit {currentUnit}
          </div>
          <div className="text-lg font-bold text-white">
            {units.find(u => u.status === 'current')?.title || 'Your Current Unit'}
          </div>
        </div>
        <span className="text-2xl">📊</span>
      </div>

      {/* Path track - vertical line */}
      <div className="absolute left-[300px] top-0 bottom-0 w-1 bg-border" />

      {/* Units with mascot */}
      <div className="relative">
        {units.map((unit) => (
          <div key={unit.unitId} className="relative mb-[120px] last:mb-0">
            <PathNode {...unit} />
          </div>
        ))}
        
        {/* Mascot follows current unit */}
        <PathMascot currentUnit={currentUnit} />
      </div>
    </div>
  );
};

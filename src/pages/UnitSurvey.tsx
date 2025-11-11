import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { NodeSurveyRenderer } from '@/components/surveys/NodeSurveyRenderer';
import { learningPathService } from '@/services/learningPathService';
import { useAuth } from '@/hooks/useAuth';
import { CelebrationModal } from '@/components/path/CelebrationModal';
import { toast } from 'sonner';

const UnitSurvey = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  const nodeId = searchParams.get('nodeId');
  const nodeType = searchParams.get('type') as 'domain_drill' | 'connection_explore' | 'local_measure' | 'knowledge_review';

  const handleComplete = async (completionData: any) => {
    if (!user?.id || !nodeId) return;

    const result = await learningPathService.completeNode(
      user.id,
      nodeId,
      completionData
    );

    if (result.success) {
      toast.success(`🎉 Day completed! +${result.insightsEarned} insights`, {
        duration: 2000,
      });

      // Emit event for UI refresh
      window.dispatchEvent(new CustomEvent('nodeCompleted'));

      if (result.nextNodeUnlocked) {
        toast.success("🚀 Next day unlocked!", {
          duration: 2000,
        });
      }

      // Navigate back to path after brief delay
      setTimeout(() => {
        navigate('/path');
      }, 2500);
    } else {
      toast.error('Failed to complete lesson. Please try again.');
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    navigate('/learning-path');
  };

  if (!nodeId || !nodeType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid task</h2>
          <p className="text-muted-foreground">Please select a task from the learning path.</p>
          <button
            onClick={() => navigate('/learning-path')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <NodeSurveyRenderer
        nodeId={nodeId}
        nodeType={nodeType}
        onComplete={handleComplete}
      />
      {showCelebration && celebrationData && (
        <CelebrationModal
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          unitNumber={celebrationData.unitNumber}
          insightsEarned={celebrationData.insightsEarned}
          isCheckpoint={celebrationData.isCheckpoint}
          newBadges={celebrationData.newBadges}
          onViewInsights={celebrationData.onViewInsights}
        />
      )}
    </>
  );
};

export default UnitSurvey;

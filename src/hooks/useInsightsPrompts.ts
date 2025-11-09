import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useInsightsPrompts = (completedTasksCount: number) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Prompt after completing 3 tasks
    if (completedTasksCount === 3) {
      setTimeout(() => {
        toast('🧠 Ready to see your community impact?', {
          action: {
            label: 'View Insights',
            onClick: () => navigate('/insights')
          },
          duration: 6000
        });
      }, 2000);
    }
    
    // Weekly prompt (every 7 completed tasks)
    if (completedTasksCount % 7 === 0 && completedTasksCount > 0) {
      setTimeout(() => {
        toast('📊 Weekly insights ready! See how you\'re making a difference', {
          action: {
            label: 'Check Progress',
            onClick: () => navigate('/insights')
          },
          duration: 8000
        });
      }, 1000);
    }
  }, [completedTasksCount, navigate]);
};

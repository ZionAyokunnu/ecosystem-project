import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ResponseRateBadgeProps {
  surveyId?: string;
  parentId?: string;
  childId?: string;
  className?: string;
}

const ResponseRateBadge: React.FC<ResponseRateBadgeProps> = ({ 
  surveyId, 
  parentId, 
  childId, 
  className 
}) => {
  const [responseCount, setResponseCount] = useState<number>(0);
  const [populationSize] = useState<number>(500); // Mock population size
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponseCount = async () => {
      try {
        let query = supabase.from('relationship_user_responses').select('response_id', { count: 'exact' });
        
        if (parentId && childId) {
          query = query.eq('parent_id', parentId).eq('child_id', childId);
        }
        
        const { count, error } = await query;
        
        if (error) {
          console.error('Error fetching response count:', error);
          return;
        }
        
        setResponseCount(count || 0);
      } catch (error) {
        console.error('Error in fetchResponseCount:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseCount();
  }, [surveyId, parentId, childId]);

  if (loading) {
    return <Badge variant="outline" className={className}>Loading...</Badge>;
  }

  const percentage = Math.round((responseCount / populationSize) * 100);
  const isLowResponse = percentage < 10;
  const isGoodResponse = percentage >= 25;

  return (
    <Badge 
      variant={isLowResponse ? "destructive" : isGoodResponse ? "default" : "secondary"}
      className={className}
    >
      {responseCount}/{populationSize} responses ({percentage}%)
    </Badge>
  );
};

export default ResponseRateBadge;
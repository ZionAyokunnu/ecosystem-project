
import { supabase } from '@/integrations/supabase/client';

export interface Benchmark {
  id: string;
  indicator_id: string;
  target_value: number;
  benchmark_type: string;
  description?: string;
}

export const getBenchmarks = async (indicatorId?: string): Promise<Benchmark[]> => {
  try {
    let query = supabase
      .from('benchmarks')
      .select('*');
    
    if (indicatorId) {
      query = query.eq('indicator_id', indicatorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching benchmarks:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getBenchmarks:', error);
    return [];
  }
};

export const getBenchmark = async (indicatorId: string): Promise<Benchmark | null> => {
  const benchmarks = await getBenchmarks(indicatorId);
  return benchmarks.length > 0 ? benchmarks[0] : null;
};
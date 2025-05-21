
import { supabase } from '@/integrations/supabase/client';
import { Indicator, Relationship, HistoricalTrend, SimulationProfile, SimulationChange, PredictionResult } from '@/types';

// Indicators API
export const getIndicators = async (): Promise<Indicator[]> => {
  const { data, error } = await supabase
    .from('indicators')
    .select('*');
  
  if (error) throw error;
  return data as Indicator[];
};

export const getIndicatorById = async (indicator_id: string): Promise<Indicator> => {
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .eq('indicator_id', indicator_id)
    .single();
  
  if (error) throw error;
  return data as Indicator;
};

// Relationships API
export const getRelationships = async (): Promise<Relationship[]> => {
  const { data, error } = await supabase
    .from('relationships')
    .select('*');
  
  if (error) throw error;
  return data as Relationship[];
};

export const getChildrenByParentId = async (parent_id: string): Promise<Relationship[]> => {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('parent_id', parent_id);
  
  if (error) throw error;
  return data as Relationship[];
};

export const getParentsByChildId = async (child_id: string): Promise<Relationship[]> => {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('child_id', child_id);
  
  if (error) throw error;
  return data as Relationship[];
};

// Historical Trends API
export const getTrendsByIndicatorId = async (indicator_id: string): Promise<HistoricalTrend[]> => {
  const { data, error } = await supabase
    .from('historical_trends')
    .select('*')
    .eq('indicator_id', indicator_id)
    .order('year', { ascending: true });
  
  if (error) throw error;
  return data as HistoricalTrend[];
};

// Prediction API
export const predictTrend = async (indicator_id: string): Promise<PredictionResult> => {
  // In a real implementation, this would call a machine learning endpoint
  // For now, we'll simulate a prediction with some simple extrapolation
  const trends = await getTrendsByIndicatorId(indicator_id);
  const indicator = await getIndicatorById(indicator_id);
  
  if (trends.length === 0) {
    return {
      indicator_id,
      years: [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2],
      values: [indicator.current_value, indicator.current_value, indicator.current_value],
      summary: "No historical data available for prediction."
    };
  }
  
  // Simple linear extrapolation for demonstration
  const sortedTrends = [...trends].sort((a, b) => a.year - b.year);
  const lastYear = sortedTrends[sortedTrends.length - 1].year;
  const lastValue = sortedTrends[sortedTrends.length - 1].value;
  
  // Calculate average yearly change
  let avgYearlyChange = 0;
  if (sortedTrends.length > 1) {
    const totalChange = lastValue - sortedTrends[0].value;
    const yearsSpan = lastYear - sortedTrends[0].year;
    avgYearlyChange = yearsSpan > 0 ? totalChange / yearsSpan : 0;
  }
  
  // Generate future values
  const futureYears = [lastYear + 1, lastYear + 2, lastYear + 3];
  const futureValues = futureYears.map((year, index) => {
    const value = lastValue + avgYearlyChange * (index + 1);
    return Math.max(0, Math.min(100, value)); // Constrain to 0-100
  });
  
  // Generate summary
  let summary = "";
  if (avgYearlyChange > 1) {
    summary = `${indicator.name} is trending upward at approximately ${avgYearlyChange.toFixed(1)} points per year.`;
  } else if (avgYearlyChange < -1) {
    summary = `${indicator.name} is trending downward at approximately ${Math.abs(avgYearlyChange).toFixed(1)} points per year.`;
  } else {
    summary = `${indicator.name} is relatively stable with minimal change predicted.`;
  }
  
  return {
    indicator_id,
    years: [...sortedTrends.map(t => t.year), ...futureYears],
    values: [...sortedTrends.map(t => t.value), ...futureValues],
    summary
  };
};

// Simulations API
export const createSimulation = async (name: string, description: string, changes: SimulationChange[]): Promise<string> => {
  // Create simulation profile
  const { data: profileData, error: profileError } = await supabase
    .from('simulation_profiles')
    .insert([{ name, description }])
    .select();
  
  if (profileError) throw profileError;
  
  const simulation_id = profileData[0].simulation_id;
  
  // Add changes to the simulation
  const changesWithSimulationId = changes.map(change => ({
    ...change,
    simulation_id
  }));
  
  const { error: changesError } = await supabase
    .from('simulation_changes')
    .insert(changesWithSimulationId);
  
  if (changesError) throw changesError;
  
  return simulation_id;
};

export const getSimulationById = async (simulation_id: string): Promise<{ profile: SimulationProfile, changes: SimulationChange[] }> => {
  // Get simulation profile
  const { data: profileData, error: profileError } = await supabase
    .from('simulation_profiles')
    .select('*')
    .eq('simulation_id', simulation_id)
    .single();
  
  if (profileError) throw profileError;
  
  // Get simulation changes
  const { data: changesData, error: changesError } = await supabase
    .from('simulation_changes')
    .select('*')
    .eq('simulation_id', simulation_id);
  
  if (changesError) throw changesError;
  
  return {
    profile: profileData as SimulationProfile,
    changes: changesData as SimulationChange[]
  };
};

export const getUserSimulations = async (user_id?: string): Promise<SimulationProfile[]> => {
  let query = supabase.from('simulation_profiles').select('*').order('created_at', { ascending: false });
  
  if (user_id) {
    query = query.eq('user_id', user_id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as SimulationProfile[];
};

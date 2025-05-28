import { supabase } from '@/integrations/supabase/client';
import { Indicator, Relationship, HistoricalTrend, SimulationProfile, SimulationChange, PredictionResult, QualitativeStory } from '@/types';

// Indicators API
export const getIndicators = async (): Promise<Indicator[]> => {
  const { data, error } = await supabase
    .from('indicators')
    .select('*');
  
  if (error) throw error;
  return data as Indicator[];
};

export const updateIndicatorValue = async (indicator_id: string, new_value: number): Promise<void> => {
  const { error } = await supabase
    .from('indicators')
    .update({ current_value: new_value, updated_at: new Date().toISOString() })
    .eq('indicator_id', indicator_id);
  
  if (error) throw error;
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

// Qualitative Stories API
export const getQualitativeStories = async (parent_id: string, child_id: string) 
: Promise<QualitativeStory[]> => {
  const { data, error } = await supabase
    .from('qualitative_stories')
    .select('*')
    .eq('parent_id', parent_id)
    .eq('child_id', child_id)
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (error) throw error;
  return data as QualitativeStory[];
};

export const createQualitativeStory = async (story: {
  parent_id: string;
  child_id: string;
  story_text: string;
  author: string;
  location: string;
  photo: string | null;
}): Promise<QualitativeStory> => {
  const { data, error } = await supabase
    .from('qualitative_stories')
    .insert([story])
    .select()
    .single();
  
  if (error) throw error;
  return data as QualitativeStory;
};

  // Prediction API with location support
export const predictTrend = async (indicator_id: string, location_id: string = '00000000-0000-0000-0000-000000000000'): Promise<PredictionResult> => {
  // Get indicator values for the specific location
  const { data: values, error: valuesError } = await supabase
    .from('indicator_values')
    .select('*')
    .eq('indicator_id', indicator_id)
    .eq('location_id', location_id)
    .order('year', { ascending: true });
  
  if (valuesError) throw valuesError;
  const indicator = await getIndicatorById(indicator_id);
  
  if (!values || values.length === 0) {
    return {
      indicator_id,
      years: [new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2],
      values: [indicator.current_value, indicator.current_value, indicator.current_value],
      summary: "No historical data available for prediction."
    };
  }
  
  // Simple linear extrapolation for demonstration
  const sortedValues = [...values].sort((a, b) => a.year - b.year);
  const lastYear = sortedValues[sortedValues.length - 1].year;
  const lastValue = Number(sortedValues[sortedValues.length - 1].value);
  
  // Calculate average yearly change
  let avgYearlyChange = 0;
  if (sortedValues.length > 1) {
    const totalChange = lastValue - Number(sortedValues[0].value);
    const yearsSpan = lastYear - sortedValues[0].year;
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
    years: [...sortedValues.map(v => v.year), ...futureYears],
    values: [...sortedValues.map(v => Number(v.value)), ...futureValues],
    summary
  };
};

// Simulation with bi-directional propagation
export const runSimulation = async (
  indicatorId: string,
  newValue: number,
  locationId: string = '00000000-0000-0000-0000-000000000000'
): Promise<{ indicator_id: string; previous_value: number; new_value: number }[]> => {
  // Get current indicator values
  const { data: currentValues, error: valuesError } = await supabase
    .from('indicator_values')
    .select('*')
    .eq('location_id', locationId)
    .eq('year', new Date().getFullYear());
  
  if (valuesError) throw valuesError;
  
  // Get relationships for propagation
  const relationships = await getRelationships();
  
  // Create value map for easy lookup
  const valueMap = new Map<string, number>();
  currentValues?.forEach(v => {
    valueMap.set(v.indicator_id, Number(v.value));
  });
  
  // Initialize simulation results
  const results: { indicator_id: string; previous_value: number; new_value: number }[] = [];
  const deltas = new Map<string, number>();
  
  // Set initial delta
  const originalValue = valueMap.get(indicatorId) || 0;
  deltas.set(indicatorId, newValue - originalValue);
  
  // Propagate changes (simplified bidirectional)
  const processedIds = new Set<string>();
  const toProcess = [indicatorId];
  
  while (toProcess.length > 0) {
    const currentId = toProcess.shift()!;
    if (processedIds.has(currentId)) continue;
    processedIds.add(currentId);
    
    const currentDelta = deltas.get(currentId) || 0;
    if (Math.abs(currentDelta) < 0.01) continue; // Skip negligible changes
    
    // Propagate to children
    const childRelationships = relationships.filter(r => r.parent_id === currentId);
    for (const rel of childRelationships) {
      const childDelta = currentDelta * Number(rel.influence_weight);
      const existingDelta = deltas.get(rel.child_id) || 0;
      deltas.set(rel.child_id, existingDelta + childDelta);
      toProcess.push(rel.child_id);
    }
    
    // Propagate to parents
    const parentRelationships = relationships.filter(r => r.child_id === currentId);
    for (const rel of parentRelationships) {
      const parentDelta = currentDelta * Number(rel.child_to_parent_weight || 0.1);
      const existingDelta = deltas.get(rel.parent_id) || 0;
      deltas.set(rel.parent_id, existingDelta + parentDelta);
      toProcess.push(rel.parent_id);
    }
  }
  
  // Generate results
  for (const [id, delta] of deltas.entries()) {
    const previousValue = valueMap.get(id) || 0;
    const newVal = Math.max(0, Math.min(100, previousValue + delta));
    
    if (Math.abs(delta) >= 0.01) { // Only include significant changes
      results.push({
        indicator_id: id,
        previous_value: previousValue,
        new_value: newVal
      });
    }
  }
  
  return results;
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

import { supabase } from '../integrations/supabase/client';

export const getIndicatorValue = async (indicatorId: string, locationId: string): Promise<number> => {
  const { data, error } = await (supabase as any)
    .rpc('get_indicator_current_value', {
      p_indicator_id: indicatorId,
      p_location_id: locationId
    });
    
  if (error) {
    console.error('Error fetching indicator value:', error);
    return 50; // Default fallback
  }
  
  return data || 50;
};

export const getIndicatorWithCurrentValue = async (indicatorId: string, locationId: string) => {
  const [indicator, currentValue] = await Promise.all([
    supabase.from('indicators').select('*').eq('id', indicatorId).single(),
    getIndicatorValue(indicatorId, locationId)
  ]);
  
  if (indicator.error) throw indicator.error;
  
  return {
    ...indicator.data,
    current_value: currentValue,
    indicator_id: indicator.data.id  // Compatibility alias
  };
};

export const getIndicatorTrend = async (
  indicatorId: string, 
  locationId: string, 
  yearsBack: number = 2
): Promise<number> => {
  const { data, error } = await (supabase as any)
    .rpc('get_indicator_trend', {
      p_indicator_id: indicatorId,
      p_location_id: locationId,
      p_years_back: yearsBack
    });
    
  if (error) {
    console.error('Error fetching indicator trend:', error);
    return 0;
  }
  
  return data || 0;
};

export const recordUserMeasurement = async (
  indicatorId: string, 
  locationId: string, 
  value: number,
  userId: string,
  confidenceScore?: number,
  qualitativeNotes?: string
) => {
  // Record in local_measurements for user tracking
  const { error: measurementError } = await supabase
    .from('local_measurements')
    .insert({
      user_id: userId,
      indicator_id: indicatorId,
      location_id: locationId,
      current_state_rating: Math.round(value),
      personal_confidence: confidenceScore || 3,
      qualitative_notes: qualitativeNotes,
      trend_direction: 0,
      created_at: new Date().toISOString()
    });
    
  if (measurementError) {
    console.error('Error recording measurement:', measurementError);
    throw measurementError;
  }
  
  // Update or insert aggregated value
  const { error: valueError } = await supabase
    .from('indicator_values')
    .upsert({
      indicator_id: indicatorId,
      location_id: locationId,
      year: new Date().getFullYear(),
      value: value,
      data_source: 'user_measurement',
      confidence_score: confidenceScore || 3,
      sample_size: 1
    }, {
      onConflict: 'indicator_id,location_id,year'
    });
    
  if (valueError) {
    console.error('Error updating indicator value:', valueError);
    throw valueError;
  }
};

export const getIndicatorHistory = async (
  indicatorId: string,
  locationId: string,
  years: number = 5
) => {
  const currentYear = new Date().getFullYear();
  const { data, error } = await supabase
    .from('indicator_values')
    .select('year, value')
    .eq('indicator_id', indicatorId)
    .eq('location_id', locationId)
    .gte('year', currentYear - years)
    .order('year', { ascending: true });
    
  if (error) {
    console.error('Error fetching indicator history:', error);
    return [];
  }
  
  return data || [];
};

export const calculateCorrelation = async (
  indicator1Id: string,
  indicator2Id: string,
  minYears: number = 3
) => {
  const { data, error } = await (supabase as any)
    .rpc('calculate_indicator_correlation', {
      p_indicator1_id: indicator1Id,
      p_indicator2_id: indicator2Id,
      p_min_years: minYears
    });
    
  if (error) {
    console.error('Error calculating correlation:', error);
    return null;
  }
  
  return data?.[0] || null;
};

export const updateAllCorrelations = async () => {
  const { data, error } = await (supabase as any).rpc('update_all_correlations');
  
  if (error) {
    console.error('Error updating correlations:', error);
    throw error;
  }
  
  return data;
};

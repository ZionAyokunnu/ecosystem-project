
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationPath, IndicatorValue } from '@/types';

// Get all root locations (countries)
export const getRootLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .is('parent_id', null)
    .order('name');
  
  if (error) throw error;
  return data as Location[];
};

// Get children of a specific location
export const getLocationChildren = async (parentId: string | null = null): Promise<Location[]> => {
  const { data, error } = await supabase.rpc('get_location_children', {
    parent_location_id: parentId
  });
  
  if (error) throw error;
  return data as Location[];
};

// Get location hierarchy path
export const getLocationPath = async (locationId: string): Promise<LocationPath[]> => {
  const { data, error } = await supabase.rpc('get_location_path', {
    target_location_id: locationId
  });
  
  if (error) throw error;
  return data as LocationPath[];
};

// Get indicator values for a specific location and year
export const getIndicatorValues = async (
  locationId: string, 
  year: number = new Date().getFullYear()
): Promise<IndicatorValue[]> => {
  const { data, error } = await supabase
    .from('indicator_values')
    .select('*')
    .eq('location_id', locationId)
    .eq('year', year);
  
  if (error) throw error;
  return data as IndicatorValue[];
};

// Update indicator value for a location
export const updateIndicatorValue = async (
  indicatorId: string,
  locationId: string,
  year: number,
  value: number
): Promise<void> => {
  const { error } = await supabase
    .from('indicator_values')
    .upsert({
      indicator_id: indicatorId,
      location_id: locationId,
      year,
      value,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
};

// Get data for sunburst visualization
export const getSunburstData = async (locationId: string, targetLocationId?: string) => {
  // Get indicator values for the location
  const values = await getIndicatorValues(locationId);
  let targetValues: IndicatorValue[] = [];
  
  if (targetLocationId) {
    targetValues = await getIndicatorValues(targetLocationId);
  }
  
  // Get all indicators for metadata
  const { data: indicators, error: indicatorsError } = await supabase
    .from('indicators')
    .select('*');
  
  if (indicatorsError) throw indicatorsError;
  
  // Get relationships
  const { data: relationships, error: relationshipsError } = await supabase
    .from('relationships')
    .select('*');
  
  if (relationshipsError) throw relationshipsError;
  
  return {
    indicators: indicators || [],
    relationships: relationships || [],
    values,
    targetValues
  };
};

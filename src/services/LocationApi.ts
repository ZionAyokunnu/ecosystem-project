
import { supabase } from "@/integrations/supabase/client";
import { Location, LocationPath } from "@/types";

export const getLocationChildren = async (parentId?: string): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('parent_id', parentId || null)
    .order('name');

  if (error) {
    console.error('Error fetching location children:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as 'country' | 'region' | 'city' | 'ward'
  }));
};

export const getLocationPath = async (locationId: string): Promise<LocationPath[]> => {
  const { data, error } = await supabase
    .rpc('get_location_path', { target_location_id: locationId });

  if (error) {
    console.error('Error fetching location path:', error);
    throw error;
  }

  return data || [];
};

export const getAllLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching all locations:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as 'country' | 'region' | 'city' | 'ward'
  }));
};

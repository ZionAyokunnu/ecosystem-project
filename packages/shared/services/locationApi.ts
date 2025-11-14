import { supabase } from "../integrations/supabase/client";
import { Location, LocationPath } from "../types";

// Broad alias covering all six types
type LocationType = 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward';

// 1) Core children loader, now typed to accept explicit null for roots
export const getLocationChildren = async (
  parentId: string | null
): Promise<Location[]> => {
  let builder = supabase
    .from('locations')
    .select('location_id, name, type, parent_id')
    .order('name', { ascending: true });

  if (parentId === null) {
    builder = builder.is('parent_id', null);
  } else {
    builder = builder.eq('parent_id', parentId);
  }

  const { data, error } = await builder;
  if (error) {
    console.error('Error fetching location children:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as LocationType
  }));
};

// 2) Helper for walking up the tree remains unchanged
export const getLocationPath = async (locationId: string): Promise<LocationPath[]> => {
  const { data, error } = await supabase
    .rpc('get_location_path', { target_location_id: locationId });
  if (error) {
    console.error('Error fetching location path:', error);
    throw error;
  }
  return data || [];
};

// 3) Convenience loaders for each level:

export const getCountries = () =>
  getLocationChildren(null)
    .then(list => list.filter(loc => loc.type === 'country'));

export const getNations = (countryId: string) =>
  getLocationChildren(countryId)
    .then(list => list.filter(loc => loc.type === 'nation'));

export const getRegions = (nationId: string) =>
  getLocationChildren(nationId)
    .then(list => list.filter(loc => loc.type === 'region'));

export const getCities = (regionId: string) =>
  getLocationChildren(regionId)
    .then(list => list.filter(loc => loc.type === 'city'));

export const getTowns = (cityId: string) =>
  getLocationChildren(cityId)
    .then(list => list.filter(loc => loc.type === 'town'));

export const getWards = (townId: string) =>
  getLocationChildren(townId)
    .then(list => list.filter(loc => loc.type === 'ward'));

// Additional exports needed for components
export const getRootLocations = () => getCountries();

export const getAllLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('location_id, name, type, parent_id')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching all locations:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    type: item.type as LocationType
  }));
};

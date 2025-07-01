
export interface Location {
  location_id: string;
  name: string;
  type: string;
  parent_id?: string;
}

// Mock location data for now - replace with actual API calls
export const getLocations = async (): Promise<Location[]> => {
  return [
    { location_id: '1', name: 'St Neots', type: 'town' },
    { location_id: '2', name: 'Cambridge', type: 'city', parent_id: '1' },
    { location_id: '3', name: 'Huntingdon', type: 'town', parent_id: '1' },
  ];
};

export const getLocationById = async (id: string): Promise<Location | null> => {
  const locations = await getLocations();
  return locations.find(loc => loc.location_id === id) || null;
};

export const getRootLocations = async (): Promise<Location[]> => {
  const locations = await getLocations();
  return locations.filter(loc => !loc.parent_id);
};

export const getLocationChildren = async (parentId: string): Promise<Location[]> => {
  const locations = await getLocations();
  return locations.filter(loc => loc.parent_id === parentId);
};

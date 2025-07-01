
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

export const getLocationChildren = async (parentId: string | null): Promise<Location[]> => {
  const locations = await getLocations();
  if (parentId === null) {
    return locations.filter(loc => !loc.parent_id);
  }
  return locations.filter(loc => loc.parent_id === parentId);
};

export const getLocationPath = async (locationId: string): Promise<Array<{ location_id: string; name: string; type: string }>> => {
  const locations = await getLocations();
  const path: Array<{ location_id: string; name: string; type: string }> = [];
  
  let currentId = locationId;
  const visited = new Set<string>();
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const location = locations.find(loc => loc.location_id === currentId);
    if (!location) break;
    
    path.unshift({
      location_id: location.location_id,
      name: location.name,
      type: location.type
    });
    
    currentId = location.parent_id || '';
  }
  
  return path;
};

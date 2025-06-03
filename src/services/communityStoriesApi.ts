
import { supabase } from '@/integrations/supabase/client';

export interface CommunityStory {
  story_id: string;
  parent_id: string; // This maps to indicator_id in our context
  child_id: string;  // We'll use this for sub-indicators or same as parent_id
  story_text: string; // This maps to body
  author: string;
  location: string | null;
  created_at: string;
  photo?: string | null;
  votes?: number; // We'll need to add this or calculate it
  title?: string; // We'll extract from story_text or add separately
  category?: string; // We'll derive from indicator
}

export interface StoryLike {
  story_id: string;
  client_uuid: string;
}

// Get stories for a location and/or indicator
export const getCommunityStories = async (params?: {
  location?: string;
  indicator_id?: string;
  exclude_id?: string;
}): Promise<CommunityStory[]> => {
  let query = supabase
    .from('qualitative_stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.location) {
    query = query.eq('location', params.location);
  }

  if (params?.indicator_id) {
    query = query.eq('parent_id', params.indicator_id);
  }

  if (params?.exclude_id) {
    query = query.neq('story_id', params.exclude_id);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

// Get story count for an indicator and location
export const getStoryCount = async (indicator_id: string, location?: string): Promise<number> => {
  let query = supabase
    .from('qualitative_stories')
    .select('story_id', { count: 'exact' })
    .eq('parent_id', indicator_id);

  if (location) {
    query = query.eq('location', location);
  }

  const { count, error } = await query;
  
  if (error) throw error;
  return count || 0;
};

// Create a new community story
export const createCommunityStory = async (story: {
  parent_id: string;
  child_id?: string;
  story_text: string;
  author: string;
  location: string | null;
  photo?: string | null;
}): Promise<CommunityStory> => {
  const storyData = {
    ...story,
    child_id: story.child_id || story.parent_id, // Use parent_id as child_id if not provided
  };

  const { data, error } = await supabase
    .from('qualitative_stories')
    .insert([storyData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Generate a client UUID for like tracking
export const getClientUuid = (): string => {
  let clientUuid = localStorage.getItem('client_uuid');
  if (!clientUuid) {
    clientUuid = crypto.randomUUID();
    localStorage.setItem('client_uuid', clientUuid);
  }
  return clientUuid;
};

// Check if story is liked by current client
export const isStoryLiked = (storyId: string): boolean => {
  return localStorage.getItem(`liked_story_${storyId}`) === 'true';
};

// Like a story (mock implementation - in real app would need story_likes table)
export const likeStory = async (storyId: string): Promise<void> => {
  const clientUuid = getClientUuid();
  const likeKey = `liked_story_${storyId}`;
  
  // Check if already liked
  if (localStorage.getItem(likeKey) === 'true') {
    return; // Already liked
  }
  
  // Mark as liked in localStorage
  localStorage.setItem(likeKey, 'true');
  
  // In a real implementation, you would:
  // 1. Insert into story_likes table
  // 2. Increment votes count in stories table
  console.log(`Story ${storyId} liked by client ${clientUuid}`);
};
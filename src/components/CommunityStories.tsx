
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getCommunityStories, likeStory, isStoryLiked, type CommunityStory } from '@/services/communityStoriesApi';
import { useEcosystem } from '@/context/EcosystemContext';
import { useLocation } from '@/context/LocationContext';


interface CommunityStoriesProps {
  indicatorId?: string;
  locationId?: string;
  maxStories?: number;
}

const CommunityStories: React.FC<CommunityStoriesProps> = ({
  indicatorId,
  locationId,
  maxStories = 3
}) => {
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();

useEffect(() => {
  fetchStories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [indicatorId, locationId, selectedLocation]);

useEffect(() => {
  // Check which stories are already liked
  const liked = new Set<string>();
  stories.forEach(story => {
    if (isStoryLiked(story.story_id)) {
      liked.add(story.story_id);
    }
  });
  setLikedStories(liked);
}, [stories]);

const fetchStories = async () => {
  setLoading(true);
  setError(null);

  try {
    const location = locationId || selectedLocation?.name || undefined;
    const stories = await getCommunityStories({
      location,
      indicator_id: indicatorId
    });

    // Take only the requested number of stories
    setStories(stories.slice(0, maxStories));
  } catch (err) {
    console.error('Error fetching community stories:', err);
    setError('Failed to load community stories');
  } finally {
    setLoading(false);
  }
};

  const handleVote = async (storyId: string) => {
    if (likedStories.has(storyId)) {
      return; // Already liked

    
    }
    try {
      await likeStory(storyId);
      setLikedStories(prev => new Set([...prev, storyId]));
      
      // Update local vote count (mock increment)
      setStories(prev => prev.map(story => 
        story.story_id === storyId 
          ? { ...story, votes: (story.votes || 0) + 1 }
          : story
      ));
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

   const toggleExpand = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const getIndicatorName = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === indicatorId);
    return indicator?.name || 'Unknown';
  };

  const getIndicatorCategory = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === indicatorId);
    return indicator?.category || 'General';
  };



  const handleViewAllStories = () => {
    navigate('/stories');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Community Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

         {stories.map(story => {
            const indicatorName = getIndicatorName(story.parent_id);
            const category = getIndicatorCategory(story.parent_id);
            const isLiked = likedStories.has(story.story_id);
            const isExpanded = expandedStory === story.story_id;
            
            return (
              <div key={story.story_id}>
                <div className="border-l-4 border-gray-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{category}</Badge>
                        <span className="text-sm text-gray-500">{indicatorName}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {story.story_text}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(story.story_id)}
                      disabled={isLiked}
                      className={`h-6 px-2 ml-2 ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                      {story.votes || 0}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>By {story.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                      {story.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(story.story_id)}
                      className="h-auto py-1 px-2"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Discuss
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                  </div>



                </div>
                     {isExpanded && (
                  <div className="ml-4 mt-2 p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-2">
                      Related discussions about {indicatorName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Discussion panel coming soon...
                    </div>
                  </div>


                )}
              </div>
              
            );
          })}
          
          {stories.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No community stories yet.</p>
              <p className="text-sm">Be the first to share your story!</p>
            </div>
          )}
          
          {stories.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllStories}
                className="w-full"
              >
                View All Stories
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityStories;
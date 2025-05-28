
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getQualitativeStories } from '@/services/api';
import { QualitativeStory } from '@/types';

interface QualitativeStoryBoxProps {
  parentId: string;
  childId: string;
}

const QualitativeStoryBox: React.FC<QualitativeStoryBoxProps> = ({
  parentId,
  childId
}) => {
  console.log('QualitativeStoryBox props → parentId:', parentId, 'childId:', childId);
  const [stories, setStories] = useState<QualitativeStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheKey, setCacheKey] = useState<string>('');

  // Client-side caching
  const getCacheKey = (parent: string, child: string) => `stories_${parent}_${child}`;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const fetchStories = async () => {
      console.log(`QualitativeStoryBox: fetchStories starting for parentId=${parentId}, childId=${childId}`);
      const key = getCacheKey(parentId, childId);
      setCacheKey(key);
      
      // Check cache first
      const cached = localStorage.getItem(key);
      const cacheTime = localStorage.getItem(`${key}_time`);
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CACHE_DURATION) {
          setStories(JSON.parse(cached));
          return;
        }
      }

      setLoading(true);
      setError(null);
      
      try {
        const fetchedStories = await getQualitativeStories(parentId, childId);
        console.log('QualitativeStoryBox: fetchedStories:', fetchedStories);
        setStories(fetchedStories);
        console.log('QualitativeStoryBox: stories state after setStories:', fetchedStories);
        
        // Cache the results
        localStorage.setItem(key, JSON.stringify(fetchedStories));
        localStorage.setItem(`${key}_time`, Date.now().toString());
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };

    if (parentId && childId) {
      fetchStories();
    }
  }, [parentId, childId]);

  const latestStory = stories.length > 0 ? stories[0] : null;

  // Debug: log rendering and current stories state
  console.log('QualitativeStoryBox: rendering, current stories:', stories);

  return (
    <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
      <CardHeader 
        className="pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span>Community Stories</span>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : latestStory ? (
            <div className="space-y-2">
              {latestStory.photo && (
                <img
                  src={latestStory.photo}
                  alt="Story"
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
              <p className="text-sm text-gray-700 leading-relaxed">
                "{latestStory.story_text}"
              </p>
              <div className="text-xs text-gray-500">
                <p>— {latestStory.author}</p>
                {latestStory.location && (
                  <p>{latestStory.location}</p>
                )}
                <p>{new Date(latestStory.created_at).toLocaleDateString()}</p>
              </div>
              {stories.length > 1 && (
                <p className="text-xs text-blue-600">
                  +{stories.length - 1} more stories
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-2">
                No stories yet for this relationship.
              </p>
              <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                Be the first to share a story
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default QualitativeStoryBox;

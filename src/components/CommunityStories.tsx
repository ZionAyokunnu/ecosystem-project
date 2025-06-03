
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CommunityStory {
  id: string;
  indicator_id: string;
  location_id: string;
  title: string;
  body: string;
  author: string;
  created_at: string;
  votes: number;
  location_name?: string;
  indicator_name?: string;
}

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
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for now - replace with Supabase query
    const mockStories: CommunityStory[] = [
      {
        id: '1',
        indicator_id: indicatorId || '1a714141-915c-49f3-981b-9f02cc435be0',
        location_id: locationId || 'ward-001',
        title: 'Community Garden Transforms Our Neighborhood',
        body: 'The new community garden has brought neighbors together and improved our local food security. Children are learning about nutrition and families are building stronger connections.',
        author: 'Sarah M.',
        created_at: '2024-01-15',
        votes: 23,
        location_name: 'Ward 5',
        indicator_name: 'Community Wellbeing'
      },
      {
        id: '2',
        indicator_id: indicatorId || '2b825252-026d-5a4f-a92c-af13dd546bf1',
        location_id: locationId || 'ward-002',
        title: 'Local Business Support Program Success',
        body: 'Our ward launched a local business support program that has helped 15 small businesses thrive. Employment rates have increased and community pride is at an all-time high.',
        author: 'Michael R.',
        created_at: '2024-01-10',
        votes: 18,
        location_name: 'Ward 3',
        indicator_name: 'Economic Vitality'
      },
      {
        id: '3',
        indicator_id: indicatorId || '3c936363-137e-6b5f-ba3d-bf24ee657cf2',
        location_id: locationId || 'ward-003',
        title: 'Youth Sports Program Makes a Difference',
        body: 'The new youth sports program has engaged over 100 young people. We\'ve seen improvements in school attendance and reduced antisocial behavior.',
        author: 'Jennifer L.',
        created_at: '2024-01-08',
        votes: 31,
        location_name: 'Ward 7',
        indicator_name: 'Health & Fitness'
      }
    ];

    // Filter stories based on props
    let filteredStories = mockStories;
    if (indicatorId) {
      filteredStories = filteredStories.filter(story => story.indicator_id === indicatorId);
    }
    if (locationId) {
      filteredStories = filteredStories.filter(story => story.location_id === locationId);
    }

    setStories(filteredStories.slice(0, maxStories));
    setLoading(false);
  }, [indicatorId, locationId, maxStories]);

  const handleVote = (storyId: string, increment: number) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, votes: story.votes + increment }
        : story
    ));
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
          {stories.map(story => (
            <div key={story.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{story.title}</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(story.id, 1)}
                    className="h-6 px-2"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    {story.votes}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {story.body}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>By {story.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {story.created_at}
                </span>
                {story.location_name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {story.location_name}
                  </span>
                )}
              </div>
            </div>
          ))}
          
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEcosystem } from '@/context/EcosystemContext';
import { useLocation } from '@/context/LocationContext';

interface CommunityStory {
  id: string;
  indicator_id: string;
  location_id: string;
  title: string;
  body: string;
  author: string;
  created_at: string;
  votes: number;
  category: string;
}

const CommunityStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock stories data - replace with Supabase query
    const mockStories: CommunityStory[] = [
      {
        id: '1',
        indicator_id: '1a714141-915c-49f3-981b-9f02cc435be0',
        location_id: 'ward-001',
        title: 'Community Garden Transforms Our Neighborhood',
        body: 'The new community garden has brought neighbors together and improved our local food security. Children are learning about nutrition and families are building stronger connections. We have seen a 40% increase in community engagement since the garden opened.',
        author: 'Sarah M.',
        created_at: '2024-01-15',
        votes: 23,
        category: 'Health'
      },
      {
        id: '2',
        indicator_id: '2b825252-026d-5a4f-a92c-af13dd546bf1',
        location_id: 'ward-002',
        title: 'Local Business Support Program Success',
        body: 'Our ward launched a local business support program that has helped 15 small businesses thrive. Employment rates have increased and community pride is at an all-time high. The program includes mentorship, funding assistance, and networking events.',
        author: 'Michael R.',
        created_at: '2024-01-10',
        votes: 18,
        category: 'Economy'
      },
      {
        id: '3',
        indicator_id: '3c936363-137e-6b5f-ba3d-bf24ee657cf2',
        location_id: 'ward-003',
        title: 'Youth Sports Program Makes a Difference',
        body: 'The new youth sports program has engaged over 100 young people. We\'ve seen improvements in school attendance and reduced antisocial behavior. Parents report their children are more confident and have developed leadership skills.',
        author: 'Jennifer L.',
        created_at: '2024-01-08',
        votes: 31,
        category: 'Health'
      },
      {
        id: '4',
        indicator_id: '4d047474-248f-7c6f-cb4e-cf35ff768df3',
        location_id: 'ward-004',
        title: 'Digital Literacy Program Bridges the Gap',
        body: 'Our community center launched a digital literacy program for seniors. Over 50 participants have learned to use smartphones and tablets. This has improved their ability to connect with family and access essential services online.',
        author: 'David K.',
        created_at: '2024-01-05',
        votes: 15,
        category: 'Education'
      },
      {
        id: '5',
        indicator_id: '5e158585-359f-8d7f-dc5f-df46ff879ef4',
        location_id: 'ward-005',
        title: 'Neighborhood Watch Program Enhances Safety',
        body: 'The neighborhood watch program has created a stronger sense of security in our area. Crime rates have decreased by 25% and neighbors are more connected. Regular meetings have fostered a true sense of community.',
        author: 'Emma T.',
        created_at: '2024-01-03',
        votes: 27,
        category: 'Safety'
      }
    ];

    setStories(mockStories);
    setFilteredStories(mockStories);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredStories(stories);
    } else {
      setFilteredStories(stories.filter(story => story.category === selectedCategory));
    }
  }, [selectedCategory, stories]);

  const categories = ['all', 'Health', 'Economy', 'Education', 'Safety', 'Environment'];

  const handleVote = (storyId: string, increment: number) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, votes: story.votes + increment }
        : story
    ));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Community Stories</h1>
          <p className="text-gray-600 mt-1">
            Real stories from community members about local initiatives and changes
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Share Your Story
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-gray-500" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedLocation && (
          <Badge variant="outline">
            Location: {selectedLocation.name}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStories.map(story => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{story.title}</h2>
                      <Badge variant="secondary">{story.category}</Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{story.body}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(story.id, 1)}
                    className="ml-4 flex flex-col items-center gap-1 h-auto py-2 px-3"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">{story.votes}</span>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span>By {story.author}</span>
                    <span>{getTimeAgo(story.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Discuss</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredStories.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
                <p className="text-gray-500 mb-4">
                  No community stories match your current filters.
                </p>
                <Button onClick={() => setSelectedCategory('all')}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityStoriesPage;
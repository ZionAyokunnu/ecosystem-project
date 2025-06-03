
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Filter, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEcosystem } from '@/context/EcosystemContext';
import { useLocation } from '@/context/LocationContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCommunityStories, createCommunityStory, likeStory, isStoryLiked, type CommunityStory } from '@/services/communityStoriesApi';



const CommunityStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    indicator_id: '',
    category: '',
    photo: ''
  });

  // Get unique categories from indicators
  const categories = ['all', ...Array.from(new Set(indicators.map(ind => ind.category))).sort()];

  useEffect(() => {
    
    fetchStories();
      }, [selectedLocation]);

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



  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredStories(stories);
    } else {
      setFilteredStories(stories.filter(story => {
        const indicator = indicators.find(ind => ind.indicator_id === story.parent_id);
        return indicator?.category === selectedCategory;
      }));
    }
      }, [selectedCategory, stories, indicators]);

      const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = selectedLocation?.name || undefined;
      const fetchedStories = await getCommunityStories({ location });
      setStories(fetchedStories);
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
      
      // Update local vote count
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

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body || !formData.indicator_id || !formData.category) {
      return;
    }

    try {
      const newStory = await createCommunityStory({
        parent_id: formData.indicator_id,
        story_text: `${formData.title}\n\n${formData.body}`,
        author: 'Anonymous', // TODO: Get from auth when implemented
        location: selectedLocation?.name || null,
        photo: formData.photo || null
      });

      // Add the new story to the top of the list
      setStories(prev => [newStory, ...prev]);
      
      // Reset form
      setFormData({ title: '', body: '', indicator_id: '', category: '', photo: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating story:', err);
    }
  };

  const getIndicatorName = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === indicatorId);
    return indicator?.name || 'Unknown';
  };

  const getIndicatorCategory = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === indicatorId);
    return indicator?.category || 'General';
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

  const isFormValid = formData.title && formData.body && formData.indicator_id && formData.category;

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
<div className="relative">Add commentMore actions
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
          
          {showForm && (
            <Card className="absolute right-0 top-12 w-96 z-10 shadow-lg">
              <CardHeader>
                <CardTitle>Share Your Story</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitStory} className="space-y-4">
                  <Input
                    placeholder="Story title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  
                  <Textarea
                    placeholder="Tell your story..."
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows={4}
                    required
                  />
                  
                  <Select
                    value={formData.indicator_id}
                    onValueChange={(value) => {
                      const indicator = indicators.find(ind => ind.indicator_id === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        indicator_id: value,
                        category: indicator?.category || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators.sort((a, b) => a.name.localeCompare(b.name)).map(indicator => (
                        <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                          {indicator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Photo URL (optional)"
                    value={formData.photo}
                    onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={!isFormValid} className="flex-1">
                      Submit
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
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
        ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchStories}>Try Again</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredStories.map(story => {
            const indicatorName = getIndicatorName(story.parent_id);
            const category = getIndicatorCategory(story.parent_id);
            const isLiked = likedStories.has(story.story_id);
            const isExpanded = expandedStory === story.story_id;
            
            // Extract title from story_text (assuming format: "Title\n\nBody")
            const parts = story.story_text.split('\n\n');
            const title = parts[0] || story.story_text.substring(0, 100) + '...';
            const body = parts.slice(1).join('\n\n') || story.story_text;
            
            return (
              <Card key={story.story_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <Badge variant="secondary">{category}</Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{body}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Related to: {indicatorName}
                      </div>





                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(story.story_id)}
                      disabled={isLiked}
                      className={`ml-4 flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                        isLiked ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{story.votes || 0}</span>
                    </Button>

                  </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">Add commentMore actions
                    <div className="flex items-center gap-4">
                      <span>By {story.author}</span>
                      <span>{getTimeAgo(story.created_at)}</span>
                      {story.location && <span>in {story.location}</span>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(story.story_id)}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Discuss
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                  </div>
                
                   {isExpanded && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Related discussions about {indicatorName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Discussion panel with related stories, charts, and recommendations coming soon...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          
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
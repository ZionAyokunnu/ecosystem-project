
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
import SuggestedInitiativeBox from '@/components/SuggestedInitiativeBox';
import { StoryCard } from '@/components/stories/StoryCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';



const CommunityStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();
  const { profile } = useAuth();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});

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

  const handleReaction = async (storyId: string, reactionType: string) => {
    if (!profile?.id) return;

    try {
      // Check if user already has this reaction
      const { data: existing } = await supabase
        .from('story_reactions')
        .select('*')
        .eq('story_id', storyId)
        .eq('user_id', profile.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('story_reactions')
          .delete()
          .eq('id', existing.id);
        
        // Update local state
        setUserReactions(prev => ({
          ...prev,
          [storyId]: prev[storyId]?.filter(r => r !== reactionType) || []
        }));
      } else {
        // Add reaction
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: profile.id,
            reaction_type: reactionType
          });
        
        // Update local state
        setUserReactions(prev => ({
          ...prev,
          [storyId]: [...(prev[storyId] || []), reactionType]
        }));
      }

      // Refresh stories to get updated counts
      fetchStories();
    } catch (err) {
      console.error('Error handling reaction:', err);
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
        <Button variant="ghost" onClick={() => navigate('/overview')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Community Stories & Calls</h1>
          <p className="text-gray-600 mt-1">
            Real stories from community members about local initiatives and changes
          </p>
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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40">
        <button
          onClick={() => setShowForm(true)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Story Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Share Your Story</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

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
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Share Story
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          {filteredStories.map(story => (
            <StoryCard
              key={story.story_id}
              story={story}
              onReaction={handleReaction}
              userReactions={userReactions[story.story_id] || []}
            />
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

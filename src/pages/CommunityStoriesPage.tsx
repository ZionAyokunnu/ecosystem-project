import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcosystem } from '@/context/EcosystemContext';
import { useLocation } from '@/context/LocationContext';
import { Input } from '@/components/ui/input';
import { type CommunityStory } from '@/services/communityStoriesApi';
import { StoryCard } from '@/components/stories/StoryCard';
import { StoryCreationModal } from '@/components/stories/StoryCreationModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useInView } from 'react-intersection-observer';



const CommunityStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});

  // Categories
  const categories = [
    { id: 'all', name: 'All Stories', emoji: '📚' },
    { id: 'environment', name: 'Environment', emoji: '🌍' },
    { id: 'health', name: 'Health', emoji: '❤️' },
    { id: 'community', name: 'Community', emoji: '🤝' },
    { id: 'economy', name: 'Economy', emoji: '💼' }
  ];

  // Infinite scroll setup
  const fetchStories = useCallback(async (page: number) => {
    let query = supabase
      .from('qualitative_stories')
      .select('*')
      .range(page * 10, (page + 1) * 10 - 1)
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      // Filter by category if needed
      query = query.ilike('story_text', `%${selectedCategory}%`);
    }

    if (searchTerm) {
      query = query.ilike('story_text', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [selectedCategory, searchTerm]);

  const { items: stories, loading, hasMore, loadMore, refresh } = useInfiniteScroll({
    fetchData: fetchStories
  });

  // Infinite scroll trigger
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  // Refresh when filters change
  useEffect(() => {
    refresh();
  }, [selectedCategory, searchTerm, refresh]);

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
      refresh();
    } catch (err) {
      console.error('Error handling reaction:', err);
    }
  };

  const handleSubmitStory = async (storyData: any) => {
    try {
      const { error } = await supabase
        .from('qualitative_stories')
        .insert({
          parent_id: storyData.parent_indicator,
          child_id: storyData.parent_indicator,
          story_text: `${storyData.title}\n\n${storyData.story_text}`,
          author: profile?.first_name || 'Anonymous',
          location: storyData.location || selectedLocation?.name || null,
          photo: storyData.media_urls[0] || null
        });

      if (!error) {
        refresh();
      }
    } catch (err) {
      console.error('Error creating story:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Search and Categories */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Community Stories</h1>
          <p className="text-muted-foreground">Share experiences and discover what others are saying</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background text-foreground hover:bg-muted border border-border'
              }`}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-2xl mx-auto space-y-6">
        {stories.map(story => (
          <StoryCard
            key={story.story_id}
            story={story}
            onReaction={handleReaction}
            userReactions={userReactions[story.story_id] || []}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading more stories...</span>
            </div>
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={ref} className="h-10" />

        {/* End of Stories */}
        {!hasMore && stories.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">🎉 You've caught up on all stories!</p>
          </div>
        )}

        {/* No Stories */}
        {!loading && stories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share a community story!</p>
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      <button
        onClick={() => setShowCreateStory(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Story Creation Modal */}
      <StoryCreationModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSubmit={handleSubmitStory}
      />
    </div>
  );
};

export default CommunityStoriesPage;

import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@ecosystem/shared';
import { supabase } from '@ecosystem/shared';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { StoryCreationModal } from '@/src/components/stories/StoryCreationModal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';

interface CommunityStory {
  story_id: string;
  story_text: string;
  author: string;
  location: string;
  photo?: string;
  created_at: string;
  reactions?: any;
}

export default function CommunityStoriesScreen() {
  const { profile } = useAuth();
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const categories = [
    { id: 'all', name: 'All', emoji: '📚' },
    { id: 'environment', name: 'Environment', emoji: '🌍' },
    { id: 'health', name: 'Health', emoji: '❤️' },
    { id: 'community', name: 'Community', emoji: '🤝' },
  ];

  useEffect(() => {
    loadStories(true);
  }, [selectedCategory, searchTerm]);

  const loadStories = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setStories([]);
      }

      const currentPage = reset ? 0 : page;
      const itemsPerPage = 10;
      
      let query = supabase
        .from('qualitative_stories')
        .select('*')
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.ilike('story_text', `%${selectedCategory}%`);
      }

      if (searchTerm) {
        query = query.ilike('story_text', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const newStories = data || [];
      
      if (reset) {
        setStories(newStories);
      } else {
        setStories(prev => [...prev, ...newStories]);
      }
      
      setHasMore(newStories.length === itemsPerPage);
      setPage(currentPage + 1);
      
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStories(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadStories(false);
    }
  };

  const handleReaction = async (storyId: string, reactionType: string) => {
    if (!profile?.id) return;

    try {
      const { data: existing } = await supabase
        .from('story_reactions')
        .select('*')
        .eq('story_id', storyId)
        .eq('user_id', profile.id)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('story_reactions')
          .delete()
          .eq('id', existing.id);
        
        setUserReactions(prev => ({
          ...prev,
          [storyId]: prev[storyId]?.filter(r => r !== reactionType) || []
        }));
      } else {
        await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: profile.id,
            reaction_type: reactionType
          });
        
        setUserReactions(prev => ({
          ...prev,
          [storyId]: [...(prev[storyId] || []), reactionType]
        }));
      }

      loadStories(true);
      
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleSubmitStory = async (storyData: any) => {
    try {
      const { error } = await supabase
        .from('qualitative_stories')
        .insert({
          parent_id: storyData.parent_indicator || 'default',
          child_id: storyData.parent_indicator || 'default',
          story_text: `${storyData.title}\n\n${storyData.story_text}`,
          author: profile?.first_name || 'Anonymous',
          location: storyData.location || null,
          photo: storyData.media_urls?.[0] || null
        });

      if (!error) {
        loadStories(true);
        setShowCreateStory(false);
      }
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const renderStory = ({ item }: { item: CommunityStory }) => (
    <StoryCard
      story={item}
      onReaction={handleReaction}
      userReactions={userReactions[item.story_id] || []}
    />
  );

  const renderHeader = () => (
    <View>
      <View className="p-6">
        <Text className="text-3xl font-bold text-center mb-2">Community Stories</Text>
        <Text className="text-gray-600 text-center mb-6">
          Share and discover experiences
        </Text>

        <Input
          placeholder="Search stories..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="mb-6"
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onPress={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.emoji} {category.name}
              </Button>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.story_id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerClassName="px-4"
      />

      <Button
        onPress={() => setShowCreateStory(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg"
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </Button>

      <StoryCreationModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSubmit={handleSubmitStory}
      />
    </SafeAreaView>
  );
}

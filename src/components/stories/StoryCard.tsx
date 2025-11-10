import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StoryCardProps {
  story: any;
  onReaction: (storyId: string, reactionType: string) => void;
  userReactions?: string[];
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onReaction, userReactions = [] }) => {
  const { profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  
  const reactionTypes = [
    { type: 'heart', emoji: '❤️', label: 'Like' },
    { type: 'helpful', emoji: '💡', label: 'Helpful' },
    { type: 'inspiring', emoji: '⭐', label: 'Inspiring' }
  ];

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const loadComments = async () => {
    const { data } = await supabase
      .from('story_comments')
      .select('*, profiles(first_name)')
      .eq('story_id', story.story_id)
      .order('created_at', { ascending: false });
    
    if (data) setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile?.id) return;

    const { error } = await supabase
      .from('story_comments')
      .insert({
        story_id: story.story_id,
        user_id: profile.id,
        comment_text: newComment
      });

    if (!error) {
      setNewComment('');
      loadComments();
    }
  };

  const handleReaction = (reactionType: string) => {
    onReaction(story.story_id, reactionType);
  };

  // Extract title and body from story_text
  const parts = story.story_text.split('\n\n');
  const title = parts[0] || story.story_text.substring(0, 100) + '...';
  const body = parts.slice(1).join('\n\n') || story.story_text;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Story Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{title}</div>
            <div className="text-sm text-gray-500">
              by {story.author || 'Community Member'} • {formatDistanceToNow(new Date(story.created_at))} ago
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 leading-relaxed">{body}</p>
        </div>

        {/* Story Image */}
        {story.photo && (
          <div className="rounded-xl overflow-hidden mb-4">
            <img 
              src={story.photo} 
              alt="Story image"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Location Tag */}
        {story.location && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              📍 {story.location}
            </span>
          </div>
        )}
      </div>

      {/* Reaction Bar */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {reactionTypes.map(reaction => {
              const isActive = userReactions.includes(reaction.type);
              const count = story.reactions?.[reaction.type] || 0;
              
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-destructive/10 text-destructive scale-110'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={`transition-transform ${
                    isActive ? 'scale-125' : ''
                  }`}>
                    {reaction.emoji}
                  </span>
                  <span>{reaction.label}</span>
                  {count > 0 && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-border px-6 py-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          {comments.length} comments
        </button>

        {showComments && (
          <div className="mt-4 space-y-3">
            {/* Add Comment Input */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border border-border rounded-lg text-sm resize-none bg-background"
                  rows={2}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm font-medium">{comment.profiles?.first_name || 'Community Member'}</div>
                    <div className="text-sm text-foreground">{comment.comment_text}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

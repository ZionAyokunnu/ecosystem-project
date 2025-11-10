import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  story: any;
  onReaction: (storyId: string, reactionType: string) => void;
  userReactions?: string[];
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onReaction, userReactions = [] }) => {
  const reactionTypes = [
    { type: 'heart', emoji: '❤️', label: 'Like' },
    { type: 'helpful', emoji: '💡', label: 'Helpful' },
    { type: 'inspiring', emoji: '⭐', label: 'Inspiring' }
  ];

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
      <div className="border-t border-gray-100 px-6 py-4">
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
                      ? 'bg-red-50 text-red-600 scale-110'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`transition-transform ${
                    isActive ? 'scale-125' : ''
                  }`}>
                    {reaction.emoji}
                  </span>
                  <span>{reaction.label}</span>
                  {count > 0 && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

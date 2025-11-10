-- Create storage bucket for story media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for uploads
CREATE POLICY "Users can upload story media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'story-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view story media" ON storage.objects
FOR SELECT USING (bucket_id = 'story-media');

-- Create comments table
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES qualitative_stories(story_id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);

-- Enable RLS
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON story_comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON story_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON story_comments
FOR DELETE USING (auth.uid() = user_id);
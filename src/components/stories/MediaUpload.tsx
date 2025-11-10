import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X } from 'lucide-react';

interface MediaUploadProps {
  onMediaUploaded: (url: string, type: 'image' | 'video') => void;
  maxFiles?: number;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUploaded, maxFiles = 3 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('story-media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('story-media')
      .getPublicUrl(filePath);

    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    onMediaUploaded(publicUrl, mediaType);
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const file = files[i];
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          await uploadFile(file);
        }
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/50 hover:bg-muted'
      }`}
    >
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        id="media-upload"
        disabled={uploading}
      />
      
      <label htmlFor="media-upload" className="cursor-pointer block">
        {uploading ? (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-primary font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Drop images or videos here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse (max {maxFiles} files)
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

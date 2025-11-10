import React, { useState } from 'react';
import { MediaUpload } from './MediaUpload';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (story: any) => void;
}

export const StoryCreationModal: React.FC<StoryCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storyData, setStoryData] = useState({
    title: '',
    story_text: '',
    parent_indicator: '',
    media_urls: [] as string[],
    location: ''
  });

  const steps = [
    { number: 1, title: 'Choose Topic', icon: '🎯' },
    { number: 2, title: 'Tell Your Story', icon: '✍️' },
    { number: 3, title: 'Add Media', icon: '📷' },
    { number: 4, title: 'Final Details', icon: '✨' }
  ];

  const categories = [
    { id: 'environment', name: 'Environment & Nature', emoji: '🌍', desc: 'Green spaces, pollution, sustainability' },
    { id: 'health', name: 'Health & Wellbeing', emoji: '❤️', desc: 'Healthcare, mental health, fitness' },
    { id: 'community', name: 'Community & Social', emoji: '🤝', desc: 'Events, connections, belonging' },
    { id: 'economy', name: 'Economy & Work', emoji: '💼', desc: 'Jobs, business, financial wellbeing' }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSubmit(storyData);
    onClose();
    // Reset form
    setStoryData({
      title: '',
      story_text: '',
      parent_indicator: '',
      media_urls: [],
      location: ''
    });
    setCurrentStep(1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return storyData.parent_indicator;
      case 2: return storyData.title && storyData.story_text.length > 20;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{steps[currentStep - 1].icon}</span>
            <div>
              <h2 className="text-xl font-bold">{steps[currentStep - 1].title}</h2>
              <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">What's your story about?</h3>
              <div className="grid gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setStoryData({...storyData, parent_indicator: category.id})}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${
                      storyData.parent_indicator === category.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Story Title</label>
                <Input
                  value={storyData.title}
                  onChange={(e) => setStoryData({...storyData, title: e.target.value})}
                  placeholder="Give your story a compelling title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Story</label>
                <Textarea
                  value={storyData.story_text}
                  onChange={(e) => setStoryData({...storyData, story_text: e.target.value})}
                  placeholder="Share your experience with the community..."
                  className="min-h-[150px]"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {storyData.story_text.length} characters (minimum 20)
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add photos or videos (optional)</h3>
              <MediaUpload
                onMediaUploaded={(url, type) => 
                  setStoryData({...storyData, media_urls: [...storyData.media_urls, url]})
                }
              />
              {storyData.media_urls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {storyData.media_urls.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt="Upload" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => setStoryData({
                          ...storyData, 
                          media_urls: storyData.media_urls.filter((_, i) => i !== index)
                        })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location (optional)</label>
                <Input
                  value={storyData.location}
                  onChange={(e) => setStoryData({...storyData, location: e.target.value})}
                  placeholder="Which area is this about?"
                />
              </div>
              
              {/* Preview */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Story Preview:</h4>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">{storyData.title}</div>
                  <div className="mt-1">{storyData.story_text.substring(0, 100)}...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-between">
            <Button
              onClick={currentStep === 1 ? onClose : handleBack}
              variant="ghost"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={currentStep === 4 ? handleSubmit : handleNext}
              disabled={!canProceed()}
            >
              {currentStep === 4 ? 'Share Story' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

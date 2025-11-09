import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedProfileFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    age: initialData?.age || '',
    family_status: initialData?.family_status || '',
    interests: initialData?.interests || [],
    occupation_sector: initialData?.occupation_sector || '',
    mobility_level: initialData?.mobility_level || '',
    time_availability: initialData?.time_availability || '',
    avatar_type: initialData?.avatar_type || 'mascot',
    avatar_data: initialData?.avatar_data || ''
  });

  const interestOptions = [
    { id: 'environment', label: 'Environment', emoji: '🌱' },
    { id: 'health', label: 'Health & Fitness', emoji: '❤️' },
    { id: 'community', label: 'Community Events', emoji: '🤝' },
    { id: 'arts', label: 'Arts & Culture', emoji: '🎨' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'volunteering', label: 'Volunteering', emoji: '🙋' },
    { id: 'education', label: 'Learning', emoji: '📚' },
    { id: 'technology', label: 'Technology', emoji: '💻' }
  ];

  const mascotOptions = [
    { id: 'owl', emoji: '🦉', name: 'Wise Owl' },
    { id: 'tree', emoji: '🌳', name: 'Growing Tree' },
    { id: 'heart', emoji: '❤️', name: 'Caring Heart' },
    { id: 'star', emoji: '⭐', name: 'Bright Star' },
    { id: 'seedling', emoji: '🌱', name: 'New Growth' }
  ];

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id: string) => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-background rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-foreground">Tell Us About You</h2>
        <p className="text-muted-foreground">Help us personalize your community experience</p>
      </div>

      {/* Avatar Selection */}
      <div className="mb-8">
        <Label className="block text-lg font-medium mb-4">Choose Your Avatar</Label>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, avatar_type: 'mascot' }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.avatar_type === 'mascot' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="text-3xl mb-2">🦉</div>
            <div className="text-sm font-medium">Mascot</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, avatar_type: 'emoji' }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.avatar_type === 'emoji' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="text-3xl mb-2">😊</div>
            <div className="text-sm font-medium">Emoji</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, avatar_type: 'photo' }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.avatar_type === 'photo' 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="text-3xl mb-2">📷</div>
            <div className="text-sm font-medium">Photo</div>
          </button>
        </div>

        {formData.avatar_type === 'mascot' && (
          <div className="grid grid-cols-5 gap-3">
            {mascotOptions.map(mascot => (
              <button
                key={mascot.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatar_data: mascot.id }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.avatar_data === mascot.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="text-2xl mb-1">{mascot.emoji}</div>
                <div className="text-xs">{mascot.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            min="5"
            max="120"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="family_status">Family Status</Label>
          <Select 
            value={formData.family_status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, family_status: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="couple">Couple</SelectItem>
              <SelectItem value="family_with_kids">Family with Children</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interests */}
      <div className="mb-8">
        <Label className="block text-lg font-medium mb-4">What Interests You?</Label>
        <p className="text-muted-foreground mb-4">Select all that apply - this helps us suggest relevant community activities</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interestOptions.map(interest => (
            <button
              key={interest.id}
              type="button"
              onClick={() => handleInterestToggle(interest.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.interests.includes(interest.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="text-2xl mb-2">{interest.emoji}</div>
              <div className="text-sm font-medium">{interest.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="time_availability">Available Time</Label>
          <Select 
            value={formData.time_availability} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, time_availability: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flexible">Very flexible schedule</SelectItem>
              <SelectItem value="evenings">Evenings and weekends</SelectItem>
              <SelectItem value="weekends_only">Weekends only</SelectItem>
              <SelectItem value="limited">Very limited time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="mobility_level">Mobility Level</Label>
          <Select 
            value={formData.mobility_level} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, mobility_level: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High - I can go anywhere</SelectItem>
              <SelectItem value="medium">Medium - Some limitations</SelectItem>
              <SelectItem value="low">Low - I prefer nearby</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(formData)}
          className="flex-1"
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { View, ScrollView, Modal, Alert } from 'react-native';
import { useEcosystem, useLocation } from '@ecosystem/shared';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storyData: any) => void;
}

export function StoryCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: StoryCreationModalProps) {
  const { indicators } = useEcosystem();
  const { selectedLocation } = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    story_text: '',
    parent_indicator: '',
    location: selectedLocation?.name || '',
    media_urls: []
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.story_text) {
      Alert.alert('Error', 'Please fill in title and story');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      story_text: '',
      parent_indicator: '',
      location: selectedLocation?.name || '',
      media_urls: []
    });
  };

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
          <Text className="text-lg font-semibold">Share Your Story</Text>
          <Button onPress={handleSubmit}>
            Post
          </Button>
        </View>

        <ScrollView className="flex-1 p-4">
          <Card className="p-6">
            <View className="gap-4">
              <View>
                <Text className="font-medium mb-2">Title</Text>
                <Input
                  value={formData.title}
                  onChangeText={(text) => 
                    setFormData(prev => ({ ...prev, title: text }))
                  }
                  placeholder="What's your story about?"
                />
              </View>

              <View>
                <Text className="font-medium mb-2">Your Story</Text>
                <Input
                  value={formData.story_text}
                  onChangeText={(text) => 
                    setFormData(prev => ({ ...prev, story_text: text }))
                  }
                  placeholder="Share your experience..."
                  multiline
                  numberOfLines={6}
                  className="min-h-[120px]"
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="font-medium mb-2">Location (optional)</Text>
                <Input
                  value={formData.location}
                  onChangeText={(text) => 
                    setFormData(prev => ({ ...prev, location: text }))
                  }
                  placeholder="Where did this happen?"
                />
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

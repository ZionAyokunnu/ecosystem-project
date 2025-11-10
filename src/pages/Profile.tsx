
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { EnhancedProfileForm } from '@/components/profile/EnhancedProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          age: data.age,
          family_status: data.family_status,
          interests: data.interests,
          occupation_sector: data.occupation_sector,
          mobility_level: data.mobility_level,
          time_availability: data.time_availability,
          avatar_type: data.avatar_type,
          avatar_data: data.avatar_data
        })
        .eq('id', userProfile?.id);

      if (error) throw error;

      updateProfile(data);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/path')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Path
          </Button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <EnhancedProfileForm
          initialData={userProfile}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Display */}
              <div className="flex items-center gap-4">
                <div className="text-6xl">
                  {userProfile.avatar_type === 'mascot' && userProfile.avatar_data === 'owl' && '🦉'}
                  {userProfile.avatar_type === 'mascot' && userProfile.avatar_data === 'tree' && '🌳'}
                  {userProfile.avatar_type === 'mascot' && userProfile.avatar_data === 'heart' && '❤️'}
                  {userProfile.avatar_type === 'mascot' && userProfile.avatar_data === 'star' && '⭐'}
                  {userProfile.avatar_type === 'mascot' && userProfile.avatar_data === 'seedling' && '🌱'}
                  {!userProfile.avatar_data && '👤'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{userProfile.first_name || 'Community Member'}</h2>
                  <p className="text-muted-foreground">{userProfile.role || 'Resident'}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Age:</span>
                  <p>{userProfile.age || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Family Status:</span>
                  <p>{userProfile.family_status || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Available Time:</span>
                  <p>{userProfile.time_availability || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Mobility:</span>
                  <p>{userProfile.mobility_level || 'Not set'}</p>
                </div>
              </div>

              {/* Interests */}
              {userProfile.interests && userProfile.interests.length > 0 && (
                <div>
                  <span className="font-medium text-muted-foreground block mb-2">Interests:</span>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest: string) => (
                      <span key={interest} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Info */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Location:</span>
                  <span className="text-muted-foreground">{userProfile.location_id || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;

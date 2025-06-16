
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/context/UserContext';
import { useLocation } from '@/context/LocationContext';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <h1 className="text-3xl font-bold">User Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userProfile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={userProfile.role} 
                onValueChange={(value: any) => updateProfile({ role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="community_rep">Community Representative</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <div className="mt-2">
                <EnhancedLocationPicker />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="onboarding"
                checked={userProfile.hasCompletedOnboarding}
                onCheckedChange={(checked) => updateProfile({ hasCompletedOnboarding: checked })}
              />
              <Label htmlFor="onboarding">Onboarding Complete</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {userProfile.name || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Role:</span> {userProfile.role}
              </div>
              <div>
                <span className="font-medium">Onboarding:</span> {userProfile.hasCompletedOnboarding ? 'Complete' : 'Pending'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/onboarding')}>
            {userProfile.hasCompletedOnboarding ? 'Retake Onboarding' : 'Start Onboarding'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

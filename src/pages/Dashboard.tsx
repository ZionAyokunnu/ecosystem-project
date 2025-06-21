
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PointsTracker from '@/components/PointsTracker';
import BadgeRenderer from '@/components/BadgeRenderer';
import { Award, BookOpen, MapPin, Plus } from 'lucide-react';
import { getUserSimulations, getSimulationById, createQualitativeStory, getIndicators } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { SimulationProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Separator } from '@radix-ui/react-select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Story entry states
  const [storyParentId, setStoryParentId] = useState<string>('');
  const [storyChildId, setStoryChildId] = useState<string>('');
  const [storyText, setStoryText] = useState<string>('');
  const [storyAuthor, setStoryAuthor] = useState<string>('');
  const [storyLocation, setStoryLocation] = useState<string>('');
  const [isAddingStory, setIsAddingStory] = useState<boolean>(false);
  const [storyPhotoFile, setStoryPhotoFile] = useState<File | null>(null);
  const [profiles, setProfiles] = useState<SimulationProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [indicators, setIndicators] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const simulationProfiles = await getUserSimulations();
        setProfiles(simulationProfiles);
      } catch (err) {
        console.error('Error fetching simulation profiles:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);
  
  const handleLoadSimulation = async (simulationId: string) => {
    try {
      const simulation = await getSimulationById(simulationId);
      
      // Find the main indicator that was affected
      const primaryChange = simulation.changes[0];
      if (primaryChange) {
        toast({
          title: "Simulation Loaded",
          description: `Loading "${simulation.profile.name}" simulation`
        });
        
        // Navigate to the detail view for this indicator
        navigate(`/detail/${primaryChange.indicator_id}`);
      } else {
        toast({
          title: "Error",
          description: "This simulation doesn't contain any changes",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error loading simulation:', err);
      toast({
        title: "Error Loading Simulation",
        description: "There was a problem loading this simulation",
        variant: "destructive"
      });
    }
  };

const handleAddStory = async () => {
  if (!storyParentId || !storyChildId || !storyText.trim() || !storyAuthor.trim()) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive"
    });
    return;
  }

  setIsAddingStory(true);
  try {
    await createQualitativeStory({
      parent_id: storyParentId,
      child_id: storyChildId,
      story_text: storyText.trim(),
      author: storyAuthor.trim(),
      location: storyLocation.trim(),
      photo: storyPhotoFile ? await storyPhotoFile.text() : null // Convert file to base64 string
    });
    
    toast({
      title: "Success",
      description: "Story added successfully"
    });
    
    // Clear form
    setStoryParentId('');
    setStoryChildId('');
    setStoryText('');
    setStoryAuthor('');
    setStoryLocation('');
    
    // Navigate back to overview to see the story
    navigate('/');
  } catch (err) {
    console.error('Error adding story:', err);
    toast({
      title: "Error",
      description: "Failed to add story",
      variant: "destructive"
    });
  } finally {
    setIsAddingStory(false);
  }
};

  useEffect(() => {
  const fetchIndicators = async () => {
    try {
      const data = await getIndicators();
      setIndicators(data);
    } catch (err) {
      console.error('Error fetching indicators:', err);
    }
  };
  fetchIndicators();
}, []);

  const handleDiveClick = () => {
    navigate('/detail');
  };

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Welcome, {profile.first_name}</h1>
        <Button onClick={() => navigate('/wallet')}>View Wallet</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Points Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PointsTracker userId={profile.id} />
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeRenderer userId={profile.id} limit={3} />
          </CardContent>
        </Card>

        {/* Survey Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Surveys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!profile.has_completed_onboarding && (
              <Button 
                onClick={() => navigate('/onboarding')}
                className="w-full"
              >
                Complete Onboarding Survey
              </Button>
            )}
            <Button 
              onClick={() => navigate('/overview')}
              variant="outline"
              className="w-full"
            >
              Explore Community Data
            </Button>
          </CardContent>
        </Card>

        {/* Add Qualitative Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Community Story
            </CardTitle>
            <CardDescription>
              Share qualitative insights about relationships between indicators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="story-parent">Parent Indicator</Label>
                <Select value={storyParentId} onValueChange={setStoryParentId}>
                  <SelectTrigger id="story-parent" className="w-full">
                    <SelectValue placeholder="Parent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators.map((indicator) => (
                      <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="story-child">Child Indicator</Label>
                <Select value={storyChildId} onValueChange={setStoryChildId}>
                  <SelectTrigger id="story-child">
                    <SelectValue placeholder="Child..." />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators.map((indicator) => (
                      <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                        {indicator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="story-text">Story *</Label>
              <Textarea
                id="story-text"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Share a story about how these indicators relate..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="story-author">Author *</Label>
                <Input
                  id="story-author"
                  value={storyAuthor}
                  onChange={(e) => setStoryAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <Label htmlFor="story-location">Location</Label>
                <Input
                  id="story-location"
                  value={storyLocation}
                  onChange={(e) => setStoryLocation(e.target.value)}
                  placeholder="City, region..."
                />
              </div>
              <div>
                <Label htmlFor="story-photo">Photo</Label>
                <Input
                  id="story-photo"
                  type="file"
                  accept="image/*"
                  onChange={e => setStoryPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddStory}
              disabled={isAddingStory || !storyParentId || !storyChildId || !storyText.trim() || !storyAuthor.trim()}
              className="w-full"
            >
              {isAddingStory ? 'Adding...' : 'Add Story'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Existing Simulation Profiles */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading simulation profiles...</p>
              </div>
            </div>
      
            ) : profiles.length > 0 ? (
            <div className="hover:shadow-md transition-shadow">
              <Card>
              <CardHeader>
                <CardDescription>
                  View and load your saved simulations.
                </CardDescription>
              </CardHeader>
              {profiles.map(profile => (
                <Card key={profile.simulation_id}
                className="min-w-[260px] max-w-sm w-full p-4 hover:shadow-lg transition-shadow border border-gray-200 rounded-lg">
                  <CardHeader>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                      {profile.created_at && (
                        <span className="text-gray-500">
                          Created on {format(new Date(profile.created_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {profile.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleLoadSimulation(profile.simulation_id)}
                      className="w-full"
                    >
                      Load Simulation
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-800">No Saved Simulations</h3>
              <p className="mt-2 text-gray-600">You haven't saved any simulations yet.</p>
              <Button 
                onClick={() => navigate('/')}
                className="mt-6"
              >
                Go to Overview
              </Button>
            </div>
          )}
        </div>

        {/* Location Info */}
        {profile.location_id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Location ID: {profile.location_id}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, getSimulationById, getIndicators, updateIndicatorValue, createQualitativeStory } from '@/services/api';
import { SimulationProfile, Indicator } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import InfluenceMetricsComputer from '@/components/InfluenceMetricsComputer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Save } from 'lucide-react';
import { useEcosystem } from '@/context/EcosystemContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';





const ProfilesView: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<SimulationProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { loading: ecoLoading, error: ecoError, indicators } = useEcosystem();
  
  // Data entry states
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [isUpdatingValue, setIsUpdatingValue] = useState<boolean>(false);
  
  // Story entry states
  const [storyParentId, setStoryParentId] = useState<string>('');
  const [storyChildId, setStoryChildId] = useState<string>('');
  const [storyText, setStoryText] = useState<string>('');
  const [storyAuthor, setStoryAuthor] = useState<string>('');
  const [storyLocation, setStoryLocation] = useState<string>('');
  const [isAddingStory, setIsAddingStory] = useState<boolean>(false);
  const [storyPhotoFile, setStoryPhotoFile] = useState<File | null>(null);

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


  const handleUpdateIndicatorValue = async () => {
    if (!selectedIndicatorId || !newValue) {
      toast({
        title: "Validation Error",
        description: "Please select an indicator and enter a value",
        variant: "destructive"
      });
      return;
    }

    const numericValue = parseFloat(newValue);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      toast({
        title: "Validation Error",
        description: "Value must be a number between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingValue(true);
    try {
      await updateIndicatorValue(selectedIndicatorId, numericValue);
      
      toast({
        title: "Success",
        description: "Indicator value updated successfully"
      });
      
      // Clear form
      setSelectedIndicatorId('');
      setNewValue('');
      
      // Navigate back to overview to see changes
      navigate('/');
    } catch (err) {
      console.error('Error updating indicator:', err);
      toast({
        title: "Error",
        description: "Failed to update indicator value",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingValue(false);
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
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h1 className="text-3xl font-bold">Simulation Profiles</h1>
            <p className="mt-2">Review and load previously saved simulations</p>
          </div>
          
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600">Error Loading Profiles</h2>
            <p className="mt-2">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="mt-2">Manage simulation profiles and update indicator data</p>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Data Entry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Update Current Values */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Update Indicator Values
                </CardTitle>
                <CardDescription>
                  Update current values for indicators. Changes will automatically sync with historical trends.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="indicator-select">Select Indicator</Label>
                  <Select value={selectedIndicatorId} onValueChange={setSelectedIndicatorId}>
                    <SelectTrigger id="indicator-select">
                      <SelectValue placeholder="Choose an indicator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {indicators.map((indicator) => (
                        <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                          {indicator.name} (Current: {indicator.current_value.toFixed(1)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="new-value">New Current Value (0-100)</Label>
                  <Input
                    id="new-value"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter new value..."
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpdateIndicatorValue}
                  disabled={isUpdatingValue || !selectedIndicatorId || !newValue}
                  className="w-full"
                >
                  {isUpdatingValue ? 'Updating...' : 'Update Value'}
                </Button>
              </CardFooter>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="story-parent">Parent Indicator</Label>
                    <Select value={storyParentId} onValueChange={setStoryParentId}>
                      <SelectTrigger id="story-parent">
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
          </div>

          <Separator />

          {/* Existing Simulation Profiles */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Simulation Profiles</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading simulation profiles...</p>
                </div>
              </div>
        
             ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map(profile => (
                  <Card key={profile.simulation_id} className="hover:shadow-md transition-shadow">
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

          <Separator />

          {/* Influence Metrics Computer */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Influence Metrics</h2>
            {ecoLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : ecoError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ecoError.message}</AlertDescription>
              </Alert>
            ) : (
              <InfluenceMetricsComputer />
            )}
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default ProfilesView;

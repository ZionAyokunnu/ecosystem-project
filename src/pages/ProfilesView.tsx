
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSimulations, getSimulationById } from '@/services/api';
import { SimulationProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import InfluenceMetricsComputer from '@/components/InfluenceMetricsComputer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useEcosystem } from '@/context/EcosystemContext';
import { Skeleton } from '@/components/ui/skeleton';






const ProfilesView: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<SimulationProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { loading: ecoLoading, error: ecoError } = useEcosystem();
  


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
          <h1 className="text-3xl font-bold">Simulation Profiles</h1>
          <p className="mt-2">Review and load previously saved simulations</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div>
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading simulation profiles...</p>
                </div>
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
              <h2 className="text-xl font-semibold text-gray-800">No Saved Simulations</h2>
              <p className="mt-2 text-gray-600">You haven't saved any simulations yet.</p>
              <Button 
                onClick={() => navigate('/')}
                className="mt-6"
              >
                Go to Overview
              </Button>
            </div>
          )}
          <div className="mt-10">
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

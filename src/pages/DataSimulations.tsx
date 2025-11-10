import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DataSimulations: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [simulationProfiles, setSimulationProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Only allow researchers and admins
  if (profile?.role !== 'researcher' && profile?.role !== 'admin') {
    navigate('/path');
    return null;
  }

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('simulation_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulationProfiles(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSimulation = (simulationId: string) => {
    navigate(`/detail?simulationId=${simulationId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/path')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Data Simulations</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulationProfiles.length > 0 ? (
            simulationProfiles.map((simulation) => (
              <Card key={simulation.simulation_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{simulation.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {simulation.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Created: {new Date(simulation.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => handleLoadSimulation(simulation.simulation_id)}
                    className="w-full"
                  >
                    Load Simulation
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No simulation profiles found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DataSimulations;

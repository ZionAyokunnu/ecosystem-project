
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEcosystem } from '@/context/EcosystemContext';
import SunburstChart from '@/components/SunburstChart';
import DescriptionPanel from '@/components/DescriptionPanel';
import TrendGraph from '@/components/TrendGraph';
import Simulator from '@/components/Simulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  transformToSunburstData, 
  getTopDrivers, 
  simulateChanges, 
  buildIndicatorTree
} from '@/utils/indicatorUtils';
import { getIndicatorById, predictTrend, createSimulation } from '@/services/api';
import { Indicator, SimulationChange, PredictionResult, SunburstNode } from '@/types';
import { toast } from '@/components/ui/use-toast';
import Breadcrumbs from '@/components/Breadcrumbs';

const DetailView: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>();
  const navigate = useNavigate();
  const { indicators, relationships, loading, error, userSettings, refreshData } = useEcosystem();
  
  const [coreIndicator, setCoreIndicator] = useState<Indicator | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string, name: string }>>([]);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [localIndicators, setLocalIndicators] = useState<Indicator[]>([]);
  const [simulationChanges, setSimulationChanges] = useState<SimulationChange[]>([]);
  const [topDrivers, setTopDrivers] = useState<{positiveDrivers: Indicator[], negativeDrivers: Indicator[]}>({
    positiveDrivers: [],
    negativeDrivers: []
  });
  const [simulationDrivers, setSimulationDrivers] = useState<{positiveDrivers: Indicator[], negativeDrivers: Indicator[]}>({
    positiveDrivers: [],
    negativeDrivers: []
  });
  const [visibleNodes, setVisibleNodes] = useState<SunburstNode[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  
  // Load core indicator and prepare data
  useEffect(() => {
    console.log('DetailView useEffect:', { indicatorId, loading, indicatorsCount: indicators.length });
    if (!indicatorId || loading || indicators.length === 0) return;
    
    const loadIndicatorData = async () => {
      setIsLoading(true);
      try {
        // Try to find the indicator in the already loaded indicators
        let indicator = indicators.find(ind => ind.indicator_id === indicatorId);
        
        // If not found, try to fetch it directly
        if (!indicator) {
          indicator = await getIndicatorById(indicatorId);
        }
        
        if (indicator) {
          setCoreIndicator(indicator);
          
          // Reset simulation state when changing core indicator
          setLocalIndicators(indicators);
          setSimulationChanges([]);
          
          // Get prediction data
          setIsPredicting(true);
          try {
            const prediction = await predictTrend(indicator.indicator_id);
            setPredictionData(prediction);
          } catch (err) {
            console.error('Error predicting trend:', err);
          } finally {
            setIsPredicting(false);
          }
          
          // Get top drivers
          const drivers = getTopDrivers(
            indicator.indicator_id,
            indicators,
            relationships,
            userSettings.topDriversCount
          );
          setTopDrivers(drivers);

          setSimulationDrivers(drivers);
          // Compute breadcrumbs from relationships, skipping self-links
          const path: Array<{ id: string; name: string }> = [];
          const visited = new Set<string>();
          let currentIdTemp = indicator.indicator_id;
          while (currentIdTemp && !visited.has(currentIdTemp)) {
            visited.add(currentIdTemp);
            const indItem = indicators.find(i => i.indicator_id === currentIdTemp);
            if (!indItem) break;
            path.unshift({ id: indItem.indicator_id, name: indItem.name });
            // find a parent link that is not a self-link
            const parentRel = relationships.find(rel =>
              rel.child_id === currentIdTemp && rel.parent_id !== currentIdTemp
            );
            currentIdTemp = parentRel?.parent_id ?? '';
          }
          setBreadcrumbs(path);
        }
      } catch (err) {
        console.error('Error loading indicator data:', err);
        toast({
          title: "Error Loading Data",
          description: "Could not load the indicator data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIndicatorData();
  }, [indicatorId, indicators, relationships, loading, userSettings.topDriversCount]);

  // Set visible nodes from sunburst data
  useEffect(() => {
    if (localIndicators.length > 0 && relationships.length > 0) {
      const sunburstData = transformToSunburstData(localIndicators, relationships);
      const nodes: SunburstNode[] = sunburstData.nodes.map(node => ({
        id: node.id,
        name: node.name,
        value: node.value,
        color: node.color,
        category: node.category
      }));
      setVisibleNodes(nodes);
    }
  }, [localIndicators, relationships]);

  useEffect(() => {
    console.log('Breadcrumbs updated:', breadcrumbs);
  }, [breadcrumbs]);
  
  const handleIndicatorSelect = (selectedId: string) => {
    if (selectedId === indicatorId) return;
    navigate(`/detail/${selectedId}`);
  };
  
  const handleBreadcrumbClick = (selectedId: string) => {
    navigate(`/detail/${selectedId}`);
  };
  
  const handleSimulate = (changedIndicatorId: string, newValue: number) => {
    if (!coreIndicator) return;
    
    // Perform simulation
    const { updatedIndicators, changes } = simulateChanges(
      changedIndicatorId,
      newValue,
      localIndicators,
      relationships
    );
    
    setLocalIndicators(updatedIndicators);
    setSimulationChanges(changes);
    
    // Update simulation drivers
    const updatedCore = updatedIndicators.find(ind => ind.indicator_id === coreIndicator.indicator_id);
    if (updatedCore) {
      const drivers = getTopDrivers(
        updatedCore.indicator_id,
        updatedIndicators,
        relationships,
        userSettings.topDriversCount
      );
      setSimulationDrivers(drivers);
    }
  };
  
  const handleSaveSimulation = async (name: string, description: string) => {
    if (simulationChanges.length === 0) {
      toast({
        title: "No Changes",
        description: "Please make some changes before saving the simulation.",
      });
      return;
    }
    
    try {
      const simulationId = await createSimulation(name, description, simulationChanges);
      toast({
        title: "Simulation Saved",
        description: `Simulation "${name}" has been saved successfully.`
      });
      
      // Reset simulation state
      await refreshData();
      setLocalIndicators(indicators);
      setSimulationChanges([]);
    } catch (err) {
      console.error('Error saving simulation:', err);
      toast({
        title: "Error Saving Simulation",
        description: "There was a problem saving your simulation.",
        variant: "destructive"
      });
    }
  };
  
  // Prepare sunburst data
  const sunburstData = React.useMemo(() => {
    if (coreIndicator && localIndicators.length > 0 && relationships.length > 0) {
      return transformToSunburstData(localIndicators, relationships);
    }
    return { nodes: [], links: [] };
  }, [coreIndicator, localIndicators, relationships]);
  
  const canDiveDeeper = coreIndicator && breadcrumbs.length < userSettings.maxDrillDepth;
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Error Loading Data</h2>
          <p className="mt-2">{error.message}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  console.log('DetailView render, breadcrumbs:', breadcrumbs);
  
  return (
    // right before JSX
    console.log('DetailView render, breadcrumbs:', breadcrumbs),
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h1 className="text-3xl font-bold">{coreIndicator?.name || 'Indicator Detail'}</h1>
          <p className="mt-2">{coreIndicator?.category ? `Category: ${coreIndicator.category}` : 'Loading indicator details...'}</p>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex justify-center">
                <Skeleton className="h-[600px] w-[600px] rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-md" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          ) : coreIndicator ? (
            <>
              <Breadcrumbs
                items={(breadcrumbs.length > 0) ? breadcrumbs : [{ id: coreIndicator?.indicator_id || '', name: coreIndicator?.name || '' }]}
                onNavigate={id => navigate(`/detail/${id}`)}
              />
              
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="simulation">Simulation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="pt-4">
                  <div className="flex justify-center mb-8">
                    <div className="w-full max-w-3xl">
                      <SunburstChart
                        nodes={sunburstData.nodes}
                        links={sunburstData.links}
                        onSelect={handleIndicatorSelect}
                        onBreadcrumbsChange={setBreadcrumbs}
                      />
                    </div>
                  </div>
                  
                  {canDiveDeeper && (
                    <div className="flex justify-center mb-6">
                      <Button onClick={() => handleIndicatorSelect(coreIndicator.indicator_id)} size="lg">
                        Dive Deeper
                      </Button>
                    </div>
                  )}
                  
                  <DescriptionPanel
                    coreIndicator={coreIndicator}
                    indicators={indicators}
                    relationships={relationships}
                    visibleNodes={visibleNodes}
                  />
                  
                  {isPredicting ? (
                    <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historical & Predicted Trends</h2>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-4 text-gray-500">Generating prediction...</p>
                        </div>
                      </div>
                    </div>
                  ) : predictionData ? (
                    <TrendGraph predictionData={predictionData} />
                  ) : null}
                </TabsContent>
                
                <TabsContent value="simulation" className="pt-4">
                  <div className="flex justify-center mb-8">
                    <div className="w-full max-w-3xl">
                      <SunburstChart
                        nodes={sunburstData.nodes}
                        links={sunburstData.links}
                      />
                    </div>
                  </div>
                  
                  <Simulator
                    indicators={localIndicators}
                    coreIndicator={coreIndicator}
                    onSimulate={handleSimulate}
                    changes={simulationChanges}
                    onSaveSimulation={handleSaveSimulation}
                    positiveDrivers={simulationDrivers.positiveDrivers}
                    negativeDrivers={simulationDrivers.negativeDrivers}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-800">Indicator Not Found</h2>
              <p className="mt-2 text-gray-600">The indicator you're looking for could not be found.</p>
              <Button 
                onClick={() => navigate('/')}
                className="mt-6"
              >
                Return to Overview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailView;

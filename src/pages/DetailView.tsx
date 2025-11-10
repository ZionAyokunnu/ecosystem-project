

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Indicator, Relationship, SimulationChange, PredictionResult, SunburstNode } from '@/types';
import { toast } from '@/components/ui/use-toast';
import Breadcrumbs from '@/components/Breadcrumbs';
import SunburstCenterCircle from '@/components/SunburstCenterCircle';
import SunburstFixModeToggle from '@/components/SunburstFixModeToggle';
import SimulationModal from '@/components/SimulationModal';
import SettingsDialog from '@/components/SettingsDialog';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import LLMContextToggle from '@/components/LLMContextToggle';
import { Settings } from 'lucide-react';

import { useLocation } from '@/context/LocationContext';
import { USE_MOCK_DATA, createMockData } from '@/data/mockData';

const DetailView: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>();
  const navigate = useNavigate();
  const { indicators, relationships, loading, error, userSettings, refreshData } = useEcosystem();

  const { selectedLocation: userLocation } = useLocation();

  useEffect(() => {
    if (!indicatorId && indicators.length > 0) {
      const defaultRoot = indicators.find(i => i.name.toLowerCase() === 'wellbeing') || indicators[0];
      navigate(`/detail/${defaultRoot.indicator_id}`, { replace: true });
    }
  }, [indicatorId, indicators, navigate]);
  
  const [coreIndicator, setCoreIndicator] = useState<Indicator | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string, name: string }>>([]);
  const [currentCoreId, setCurrentCoreId] = useState<string | null>(indicatorId ?? null);
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
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);

const handleCoreChange = useCallback(
  (newId: string | null) => {
    if (!newId) return;            // synthetic root; ignore
    setCurrentCoreId(newId);       // drives TrendGraph
    // const found = indicators.find(ind => ind.indicator_id === newId);
    
    // MOCK DATA: Use mock data if flag is enabled
    const dataIndicators = USE_MOCK_DATA ? createMockData().indicators : indicators;
    // ORIGINAL DB CODE:
    // const found = indicators.find(ind => ind.indicator_id === newId);
    const found = dataIndicators.find(ind => ind.indicator_id === newId);
    
    if (found) {
      setCoreIndicator(found);     // drives DescriptionPanel header & value

      // Find parent-child relationship for qualitative stories
      // const parentRelationship = relationships.find(r => r.child_id === newId);
      // MOCK DATA: Use mock data if flag is enabled
      const dataRelationships = USE_MOCK_DATA ? createMockData().relationships : relationships;
      // ORIGINAL DB CODE:
      // const parentRelationship = relationships.find(r => r.child_id === newId);
      const parentRelationship = dataRelationships.find(r => r.child_id === newId);
      
      if (parentRelationship) {
        setCurrentParentId(parentRelationship.parent_id);
        setCurrentChildId(newId);
      } else {
        // If it's a root indicator, use it as both parent and child
        setCurrentParentId(newId);
        setCurrentChildId(newId);
      }                 
    }
  },
  [indicators, relationships]
);

// IDs of wedges currently shown
const visibleIds = useMemo(
  () => visibleNodes.map(n => n.id),
  [visibleNodes]
);


const visibleIndicators = useMemo(() => {
  // MOCK DATA: Use mock data if flag is enabled
  const dataSource = USE_MOCK_DATA ? createMockData().indicators : indicators;
  // ORIGINAL DB CODE:
  // return visibleNodes
  //   .map(node => indicators.find(ind => ind.indicator_id === node.id))
  //   .filter((ind): ind is Indicator => Boolean(ind))
  
  return visibleNodes
    // //  ❌ drop the synthetic root (depth 0), if you don't want it
    // .filter(node => node.depth > 0)
    //  ✅ map each wedge back to the full Indicator
    .map(node => dataSource.find(ind => ind.indicator_id === node.id))
    //  🚨 drop any that somehow didn't resolve (shouldn't happen)
    .filter((ind): ind is Indicator => Boolean(ind))
}, [visibleNodes, indicators])

const [isFixedMode, setIsFixedMode] = useState<boolean>(false);
const [simulationModal, setSimulationModal] = useState<{ isOpen: boolean; targetId: string | null }>({
    isOpen: false,
    targetId: null
  });

useEffect(() => {
  console.log(
    "🌞 Sunburst shows:", visibleNodes.length,
    "→ IDs:", visibleNodes.map(n => n.id)
  );
  console.log(
    "📋 Simulator has:", visibleIndicators.length,
    "→ IDs:", visibleIndicators.map(i => i.indicator_id)
  );
}, [visibleNodes, visibleIndicators]);

 useEffect(() => {
     console.log('DetailView: visibleIndicators updated', visibleIndicators);
   }, [visibleIndicators]);

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
          // MOCK DATA: Use mock data if flag is enabled
          if (USE_MOCK_DATA) {
            const mockData = createMockData();
            setLocalIndicators(mockData.indicators);
          } else {
            // ORIGINAL DB CODE (uncomment when USE_MOCK_DATA = false):
            setLocalIndicators(indicators);
            // ORIGINAL DB CODE END
          }
          setSimulationChanges([]);
          
          // Get prediction data
          setIsPredicting(true);
          try {
            // ORIGINAL DB CODE: Still uses DB for predictions
            const prediction = await predictTrend(indicator.indicator_id);
            setPredictionData(prediction);
          } catch (err) {
            console.error('Error predicting trend:', err);
          } finally {
            setIsPredicting(false);
          }
          
          // MOCK DATA: Use mock data if flag is enabled
          const dataIndicators = USE_MOCK_DATA ? createMockData().indicators : indicators;
          const dataRelationships = USE_MOCK_DATA ? createMockData().relationships : relationships;
          // ORIGINAL DB CODE:
          // const drivers = getTopDrivers(
          //   indicator.indicator_id,
          //   indicators,
          //   relationships,
          //   userSettings.topDriversCount
          // );
          
          // Get top drivers
          const drivers = getTopDrivers(
            indicator.indicator_id,
            dataIndicators,
            dataRelationships,
            userSettings.topDriversCount
          );
          setTopDrivers(drivers);

          setSimulationDrivers(drivers);
          
          // Compute breadcrumbs from relationships, skipping self-links
          // MOCK DATA: Use mock data if flag is enabled
          const path: Array<{ id: string; name: string }> = [];
          const visited = new Set<string>();
          let currentIdTemp = indicator.indicator_id;
          while (currentIdTemp && !visited.has(currentIdTemp)) {
            visited.add(currentIdTemp);
            // ORIGINAL DB CODE:
            // const indItem = indicators.find(i => i.indicator_id === currentIdTemp);
            const indItem = dataIndicators.find(i => i.indicator_id === currentIdTemp);
            if (!indItem) break;
            path.unshift({ id: indItem.indicator_id, name: indItem.name });
            // find a parent link that is not a self-link
            // ORIGINAL DB CODE:
            // const parentRel = relationships.find(rel =>
            //   rel.child_id === currentIdTemp && rel.parent_id !== currentIdTemp
            // );
            const parentRel = dataRelationships.find(rel =>
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

  // (Removed: Set visible nodes from sunburst data. Now handled by SunburstChart callback)

  

  useEffect(() => {
    console.log('Breadcrumbs updated:', breadcrumbs);
  }, [breadcrumbs]);

  useEffect(() => {
    if (!currentCoreId) return;

    console.log('STEP ③2 ▶️ fetching prediction for', currentCoreId);
    setIsPredicting(true);

    predictTrend(currentCoreId)
      .then(setPredictionData)
      .catch(err => {
        console.error('Error predicting trend:', err);
        setPredictionData(null);
      })
      .finally(() => setIsPredicting(false));
  }, [currentCoreId]);

  useEffect(() => {
    if (!coreIndicator) return;
    // MOCK DATA: Use mock data if flag is enabled
    const dataIndicators = USE_MOCK_DATA ? createMockData().indicators : indicators;
    const dataRelationships = USE_MOCK_DATA ? createMockData().relationships : relationships;
    // ORIGINAL DB CODE:
    // const drivers = getTopDrivers(
    //   coreIndicator.indicator_id,
    //   indicators,
    //   relationships,
    //   userSettings.topDriversCount
    // );
    
    const drivers = getTopDrivers(
      coreIndicator.indicator_id,
      dataIndicators,
      dataRelationships,
      userSettings.topDriversCount
    );
    setTopDrivers(drivers);
    setSimulationDrivers(drivers);
  }, [coreIndicator, indicators, relationships, userSettings.topDriversCount]);

  
  const handleIndicatorSelect = (selectedId: string) => {
    if (selectedId === indicatorId) return;
    navigate(`/detail/${selectedId}`);
  };
  
    const handleSunburstNodeClick = (nodeId: string) => {
    if (isFixedMode) {
      // In fixed mode, show simulation instead of drilling down
      setSimulationModal({ isOpen: true, targetId: nodeId });
    } else {
      // Normal drill-down behavior
      navigate(`/detail/${nodeId}`);
    }
  };
  const handleBreadcrumbClick = (selectedId: string) => {
    navigate(`/detail/${selectedId}`);
  };
  
  const handleSimulate = (changedIndicatorId: string, newValue: number) => {
    if (!coreIndicator) return;
    
    // MOCK DATA: Use mock data if flag is enabled
    const dataIndicators = USE_MOCK_DATA ? createMockData().indicators : localIndicators;
    const dataRelationships = USE_MOCK_DATA ? createMockData().relationships : relationships;
    // ORIGINAL DB CODE:
    // const { updatedIndicators, changes } = simulateChanges(
    //   changedIndicatorId,
    //   newValue,
    //   localIndicators,
    //   relationships
    // );
    
    // Perform simulation
    const { updatedIndicators, changes } = simulateChanges(
      changedIndicatorId,
      newValue,
      dataIndicators,
      dataRelationships
    );
    
    setLocalIndicators(updatedIndicators);
    setSimulationChanges(changes);
    
    // Update simulation drivers
      const updatedCore = updatedIndicators.find(ind => ind.indicator_id === coreIndicator.indicator_id);
      if (updatedCore) {
        // ORIGINAL DB CODE:
        // const drivers = getTopDrivers(
        //   updatedCore.indicator_id,
        //   updatedIndicators,
        //   relationships,
        //   userSettings.topDriversCount
        // );
        const drivers = getTopDrivers(
          updatedCore.indicator_id,
          updatedIndicators,
          dataRelationships,
          userSettings.topDriversCount
        );
        setSimulationDrivers(drivers);
      }
    };
  
  // const handleSunburstNodeClick = (nodeId: string) => {
  //   if (isFixedMode) {
  //     // In fixed mode, show simulation instead of drilling downAdd commentMore actions
  //     // For now, navigate to research page
  //     navigate(`/research/${nodeId}`);
  //   } else {
  //     // Normal drill-down behavior
  //     navigate(`/detail/${nodeId}`);
  //   }
  // };
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
        description: "There was a problem saving your sim<suulation.",
        variant: "destructive"
      });
    }
  };
  
  // Prepare sunburst data
  const sunburstData = React.useMemo(() => {
    // MOCK DATA: Use mock data if flag is enabled
    if (USE_MOCK_DATA) {
      const mockData = createMockData();
      // Set coreIndicator to 'core' (root) for mock data
      if (!coreIndicator) {
        const mockCore = mockData.indicators.find(i => i.indicator_id === 'core');
        if (mockCore) {
          setCoreIndicator(mockCore);
        }
      }
      return transformToSunburstData(mockData.indicators, mockData.relationships);
    }
    
    // ORIGINAL DB CODE (uncomment when USE_MOCK_DATA = false):
    if (coreIndicator && localIndicators.length > 0 && relationships.length > 0) {
      return transformToSunburstData(localIndicators, relationships);
    }
    return { nodes: [], links: [] };
    // ORIGINAL DB CODE END
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
  };

  
  console.log('DetailView render, breadcrumbs:', breadcrumbs);
  
  const [llmMode, setLlmMode] = useState<'business' | 'community'>('business');

  return (
    <>
      <div className="location-picker-fixed">
        <EnhancedLocationPicker />
      </div>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-800 text-white">
            <h1 className="text-3xl font-bold">{coreIndicator?.name || 'Indicator Detail'}</h1>
            <p className="mt-2">{coreIndicator?.category ? `Category: ${coreIndicator.category}` : 'Loading indicator details...'}</p>
                <SettingsDialog 
                  trigger={
                    <Button className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Adjust Drill
                    </Button>
                  } 
                />
                <LLMContextToggle mode={llmMode} onModeChange={setLlmMode} />
          </div>
          
          <div className="p-6 bg-white relative z-10">
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
                    onNavigate={id => navigate(`/detail/${id}`)} depth={3}  />
              <Tabs defaultValue="analysis" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
                  <TabsTrigger value="analysis" className="data-[state=active]:bg-white">Analysis</TabsTrigger>
                  <TabsTrigger value="simulation" className="data-[state=active]:bg-white">Simulation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="mt-0 space-y-8 min-h-[800px]">
                  <div className="w-full max-w-4xl mx-auto">
                    <SunburstChart
                      nodes={sunburstData.nodes}
                      links={sunburstData.links}
                      width={600}
                      height={600}
                      onSelect={handleIndicatorSelect}
                      onBreadcrumbsChange={setBreadcrumbs}
                      onVisibleNodesChange={setVisibleNodes}
                      onCoreChange={handleCoreChange}
                    />
                  </div>
                  
                  {canDiveDeeper && (
                    <div className="flex justify-center mb-6">
                      <Button onClick={() => handleIndicatorSelect(coreIndicator.indicator_id)} size="lg">
                        Dive Deeper, but not working yet
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => navigate('/treemap')}
                      >
                        View Tree Map
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/research/${coreIndicator.indicator_id}`)}
                        size="lg"
                      >
                        Understand {coreIndicator.name}
                      </Button>
                    </div>
                  )}
                  
                  <DescriptionPanel
                    coreIndicator={coreIndicator}
                    // MOCK DATA: Use mock data if flag is enabled
                    indicators={USE_MOCK_DATA ? createMockData().indicators : indicators}
                    relationships={USE_MOCK_DATA ? createMockData().relationships : relationships}
                    // ORIGINAL DB CODE:
                    // indicators={indicators}
                    // relationships={relationships}
                    visibleNodes={visibleNodes}
                    llmMode={llmMode}
                  />
                  
                  {isPredicting ? (
                    <div className="bg-white shadow rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historical & Predicted Trends</h2>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
                          <p className="mt-4 text-gray-500">Generating prediction...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    predictionData && (
                      <TrendGraph 
                        predictionData={predictionData} 
                        title={coreIndicator.name}
                        locationName={userLocation?.name ?? ''}
                        unitLabel="%"/>
                    )
                  )}
                </TabsContent>

                <TabsContent value="simulation" className="mt-0 space-y-8 min-h-[800px]">
                  {/* Sunburst Fix Mode Toggle */}
                  <div className="flex justify-center">
                    <SunburstFixModeToggle 
                      fixMode={isFixedMode}
                      onToggle={() => setIsFixedMode(prev => !prev)}
                    />
                  </div>
                  <div className="sunburst-container flex justify-center">
                    <div className="w-full max-w-4xl mx-auto">
                      <SunburstChart
                        nodes={sunburstData.nodes}
                        links={sunburstData.links}
                        width={600}
                        height={600}
                        onCoreChange={handleCoreChange}
                        onVisibleNodesChange={setVisibleNodes}
                      />
                    </div>
                  </div>
              

                  <Simulator
                    key={visibleIndicators.length}
                    indicators={visibleIndicators}
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
             {/* Simulation Modal */}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
    <SimulationModal
      isOpen={simulationModal.isOpen}
      onClose={() => setSimulationModal({ isOpen: false, targetId: null })}
      targetIndicatorId={simulationModal.targetId || ''}
    />
    </>
  );
};

export default DetailView;

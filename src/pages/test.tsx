import LocationBreadcrumbs from '@/components/LocationBreadcrumbs';
import TargetLocationToggle from '@/components/TargetLocationToggle';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import IndicatorSelector from '@/components/IndicatorSelector';
import SmartSearchBox from '@/components/SmartSearchBox';
import SunburstCenterCircle from '@/components/SunburstCenterCircle';
import SunburstFixModeToggle from '@/components/SunburstFixModeToggle';
import CommunityStories from '@/components/CommunityStories';
import SimulationModal from '@/components/SimulationModal';
import Breadcrumbs from '@/components/Breadcrumbs';
import DescriptionPanel from '@/components/DescriptionPanel';
import LLMContextToggle from '@/components/LLMContextToggle';
import QualitativeStoryBox from '@/components/QualitativeStoryBox';
import TrendGraph from '@/components/TrendGraph';
import { Skeleton } from '@/components/ui/skeleton';
import { useEcosystem } from '@/context/EcosystemContext';
import { predictTrend } from '@/services/api';
import { Indicator, PredictionResult, SunburstNode } from '@/types';
import { getTopDrivers } from '@/utils/indicatorUtils';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { SunburstChart } from 'recharts';


const Test: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading, error, userSettings } = useEcosystem();
  const [rootIndicator, setRootIndicator] = useState<Indicator | null>(null);
  const [llmMode, setLlmMode] = useState<'business' | 'community'>('business');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const location = useLocation();
  // Get selectedLocation and targetLocation from context instead
  const { selectedLocation, targetLocation } = useEcosystem();
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [visibleNodes, setVisibleNodes] = useState<SunburstNode[]>([]);
  const [sunburstData, setSunburstData] = useState<{ nodes: SunburstNode[], links: any[] }>({ nodes: [], links: [] });
  const [topDrivers, setTopDrivers] = useState<{positiveDrivers: Indicator[], negativeDrivers: Indicator[]}>({
    positiveDrivers: [],
    negativeDrivers: []
  });


  // keep track of whichever slice is currently centred in the Sunburst
  const handleCoreChange = useCallback(
    (newId: string | null) => {
      if (!newId) return;                         // ignore synthetic root
      const found = indicators.find(i => i.indicator_id === newId);
      if (found) {
        setRootIndicator(found) // drives DescriptionPanel + TrendGraph

        // Find parent-child relationship for qualitative stories
        const parentRelationship = relationships.find(r => r.child_id === newId);
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
  // Load sunburst data when location changes
  useEffect(() => {
    const loadSunburstData = async () => {
      if (!selectedLocation && indicators.length > 0 && relationships.length > 0) {

  useEffect(() => {
    if (rootIndicator) {
      const fetchPrediction = async () => {
        setIsPredicting(true);
        try {
          const prediction = await predictTrend(
            rootIndicator.indicator_id,
            selectedLocation?.location_id
          );
          setPredictionData(prediction);
        } catch (err) {
          console.error('Error predicting trend:', err);
        } finally {
          setIsPredicting(false);
        }
      };

      fetchPrediction();
    }
  }, [rootIndicator, selectedLocation]);

  // Get top drivers
  useEffect(() => {
    if (rootIndicator && indicators.length > 0 && relationships.length > 0) {
      const drivers = getTopDrivers(
        rootIndicator.indicator_id,
        indicators,
        relationships,
        userSettings.topDriversCount
      );
      setTopDrivers(drivers);
    }
  }, [rootIndicator, indicators, relationships, userSettings.topDriversCount]);

  // Set visible nodes from sunburst data
  useEffect(() => {
    if (sunburstData.nodes.length > 0) {
      setVisibleNodes(sunburstData.nodes);
    }
  }, [sunburstData]);

  const handleIndicatorSelect = (indicatorId: string) => {
    navigate(`/detail/${indicatorId}`);
  };

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  
  const handleDiveClick = () => {
    if (rootIndicator) {
      navigate(`/detail/${rootIndicator.indicator_id}`);
      }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">s
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Ecosystem</h1>
              <p className="mt-2">Exploring socio-economic indicators and their relationships</p>
            </div>
            <LLMContextToggle mode={llmMode} onModeChange={setLlmMode} />
          </div>
            {/* Smart Search Box */}
          <div className="mt-6">
            <SmartSearchBox />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              {/* <LocationPicker /> */}
              <EnhancedLocationPicker />
              <TargetLocationToggle />
            </div>
            <LocationBreadcrumbs />
          </div>
          <div className="flex left-0 mb-4">
            <Button variant="outline" onClick={() => setIsPanelOpen(prev => !prev)}>
              {isPanelOpen ? 'Hide Panel' : 'Show Panel'}
            </Button>
          </div>
        {loading ? (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Skeleton className="h-[600px] w-[600px] rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {isPanelOpen && (
                <div className="lg:col-span-1 space-y-4">
                  <IndicatorSelector
                    onIndicatorSelect={handleIndicatorSelect}
                    currentIndicatorId={rootIndicator?.indicator_id}
                  />
                  <CommunityStories
                    indicatorId={rootIndicator?.indicator_id}
                    locationId={selectedLocation?.location_id}
                    maxStories={3}
                  />
                </div>
              )}

              <div
                className={
                  isPanelOpen
                    ? "lg:col-span-3 space-y-6"
                    : "lg:col-span-4 space-y-6"
                }
              >
                <div className="relative flex justify-center">
                  <div className="w-full max-w-3xl">
                    <SunburstChart
                      nodes={sunburstData.nodes}
                      links={sunburstData.links}
                      onSelect={handleIndicatorSelect}
                      onVisibleNodesChange={setVisibleNodes}
                      onCoreChange={handleCoreChange}
                    />
                  </div>
                  {currentParentId && currentChildId && (
                    <div className="absolute bottom-4 right-4">
                      <QualitativeStoryBox
                        parentId={currentParentId}
                        childId={currentChildId}
                      />
                    </div>
                  )}
                </div>

                {rootIndicator && (
                  <>
                    <Breadcrumbs
                        items={[{ id: rootIndicator.indicator_id, name: rootIndicator.name }]}
                        onNavigate={handleIndicatorSelect} depth={0}                    />

                    <div className="flex justify-center gap-4 mb-6">
                      <Button onClick={handleDiveClick} size="lg">
                        Dive Into {rootIndicator.name}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/research/${rootIndicator.indicator_id}`)}
                        size="lg"
                      >
                        Research {rootIndicator.name}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/treemap')}
                      >
                        View Tree Map
                      </Button>
                    </div>

                    <DescriptionPanel
                      coreIndicator={rootIndicator}
                      indicators={indicators}
                      relationships={relationships}
                      visibleNodes={visibleNodes}
                      llmMode={llmMode}
                    />

                    {isPredicting ? (
                      <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Historical & Predicted Trends
                        </h2>
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
                            <p className="mt-4 text-gray-500">Generating prediction...</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      predictionData && <TrendGraph predictionData={predictionData} />
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
    );
};

export default Test;
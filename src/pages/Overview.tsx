
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcosystem } from '@/context/EcosystemContext';
import SunburstChart from '@/components/SunburstChart';
import Breadcrumbs from '@/components/Breadcrumbs';
import DescriptionPanel from '@/components/DescriptionPanel';
import TrendGraph from '@/components/TrendGraph';
import { transformToSunburstData, getTopDrivers } from '@/utils/indicatorUtils';
import { predictTrend } from '@/services/api';
import { Indicator, PredictionResult, SunburstNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import QualitativeStoryBox from '@/components/QualitativeStoryBox';
import LLMContextToggle from '@/components/LLMContextToggle';
import { useLocation } from '@/context/LocationContext';
import LocationPicker from '@/components/LocationPicker';
import LocationBreadcrumbs from '@/components/LocationBreadcrumbs';
import TargetLocationToggle from '@/components/TargetLocationToggle';
import { getSunburstData } from '@/services/locationApi';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading, error, userSettings } = useEcosystem();
  const [rootIndicator, setRootIndicator] = useState<Indicator | null>(null);
  const [llmMode, setLlmMode] = useState<'business' | 'community'>('business');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const { selectedLocation, targetLocation } = useLocation();
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
        // Use global data
        const transformed = transformToSunburstData(indicators, relationships);
        setSunburstData(transformed);
        return;
      }
      
      if (selectedLocation) {
        try {
          const data = await getSunburstData(
            selectedLocation.location_id,
            targetLocation?.location_id
          );
          
          // Transform the location-specific data to sunburst format
          const valueMap = new Map(data.values.map(v => [v.indicator_id, Number(v.value)]));
          const targetValueMap = new Map(data.targetValues.map(v => [v.indicator_id, Number(v.value)]));
          
          // Update indicators with location-specific values
          const locationIndicators = data.indicators.map(ind => ({
            ...ind,
            current_value: valueMap.get(ind.indicator_id) || ind.current_value
          }));
          
          const transformed = transformToSunburstData(locationIndicators, data.relationships);
          setSunburstData(transformed);
        } catch (error) {
          console.error('Error loading location data:', error);
          // Fallback to global data
          const transformed = transformToSunburstData(indicators, relationships);
          setSunburstData(transformed);
        }
      }
    };
    
    loadSunburstData();
  }, [selectedLocation, targetLocation, indicators, relationships]);
  
  // Find or set the root indicator (Wellbeing)
  useEffect(() => {
    if (!loading && indicators.length > 0) {
      // Try to find the Wellbeing indicator
      const wellbeing = indicators.find(ind => ind.name.toLowerCase() === 'wellbeing');
      
      // If not found, use the first indicator
      setRootIndicator(wellbeing || indicators[0]);
    }
  }, [loading, indicators]);
  
  // Get prediction data for the root indicator
  useEffect(() => {
    if (rootIndicator) {
      const fetchPrediction = async () => {
        setIsPredicting(true);
        try {
          const prediction = await predictTrend(rootIndicator.indicator_id, locationId);
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Ecosystem</h1>
              <p className="mt-2">Exploring socio-economic indicators and their relationships</p>
            </div>
            <LLMContextToggle mode={llmMode} onModeChange={setLlmMode} />
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <LocationPicker />
              <TargetLocationToggle />
            </div>
            <LocationBreadcrumbs />
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
              <div className="relative flex justify-center mb-8">
                <div className="w-full max-w-3xl">
                  <SunburstChart
                    nodes={sunburstData.nodes}
                    links={sunburstData.links}
                    onSelect={handleIndicatorSelect}
                    onVisibleNodesChange={setVisibleNodes}
                    onCoreChange={handleCoreChange}  
                  />
                </div>

                {/* Qualitative Story Box positioned in bottom-right corner */}
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
                    onNavigate={handleIndicatorSelect}
                  />
                  
                  <div className="flex justify-center mb-6">
                    <Button onClick={handleDiveClick} size="lg">
                      Dive Into {rootIndicator.name}
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;

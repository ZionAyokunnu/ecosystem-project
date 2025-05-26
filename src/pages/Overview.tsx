
import React, { useState, useEffect } from 'react';
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

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading, error, userSettings } = useEcosystem();
  const [rootIndicator, setRootIndicator] = useState<Indicator | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [visibleNodes, setVisibleNodes] = useState<SunburstNode[]>([]);
  const [topDrivers, setTopDrivers] = useState<{positiveDrivers: Indicator[], negativeDrivers: Indicator[]}>({
    positiveDrivers: [],
    negativeDrivers: []
  });
  
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
          const prediction = await predictTrend(rootIndicator.indicator_id);
          setPredictionData(prediction);
        } catch (err) {
          console.error('Error predicting trend:', err);
        } finally {
          setIsPredicting(false);
        }
      };
      
      fetchPrediction();
    }
  }, [rootIndicator]);
  
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
    if (indicators.length > 0 && relationships.length > 0) {
      const sunburstData = transformToSunburstData(indicators, relationships);
      const nodes: SunburstNode[] = sunburstData.nodes.map(node => ({
        id: node.id,
        name: node.name,
        value: node.value,
        color: node.color,
        category: node.category
      }));
      setVisibleNodes(nodes);
    }
  }, [indicators, relationships]);
  
  const handleIndicatorSelect = (indicatorId: string) => {
    navigate(`/detail/${indicatorId}`);
  };
  
  const handleDiveClick = () => {
    if (rootIndicator) {
      navigate(`/detail/${rootIndicator.indicator_id}`);
    }
  };
  
  // Prepare sunburst data
  const sunburstData = React.useMemo(() => {
    if (indicators.length > 0 && relationships.length > 0) {
      return transformToSunburstData(indicators, relationships);
    }
    return { nodes: [], links: [] };
  }, [indicators, relationships]);
  
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
          <h1 className="text-3xl font-bold">Ecosystem</h1>
          <p className="mt-2">Exploring socio-economic indicators and their relationships</p>
        </div>
        
        <div className="p-6">
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
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-3xl">
                  <SunburstChart
                    nodes={sunburstData.nodes}
                    links={sunburstData.links}
                    onSelect={handleIndicatorSelect}
                    onVisibleNodesChange={setVisibleNodes}
                  />
                </div>
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

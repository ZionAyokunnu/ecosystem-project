import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcosystem } from '@/context/EcosystemContext';
import SunburstChart from '@/components/SunburstChart';
import DescriptionPanel from '@/components/DescriptionPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { transformToSunburstData } from '@/utils/indicatorUtils';
import { Indicator, SunburstNode } from '@/types';
import { AlertCircle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import LLMContextToggle from '@/components/LLMContextToggle';

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading, error } = useEcosystem();
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<SunburstNode[]>([]);
  const [llmMode, setLlmMode] = useState<'business' | 'community'>('community');

  useEffect(() => {
    if (indicators.length > 0 && !selectedIndicator) {
      const wellbeingIndicator = indicators.find(ind => 
        ind.name.toLowerCase().includes('wellbeing')
      ) || indicators[0];
      setSelectedIndicator(wellbeingIndicator);
    }
  }, [indicators, selectedIndicator]);

  const handleIndicatorSelect = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.indicator_id === indicatorId);
    if (indicator) {
      setSelectedIndicator(indicator);
    }
  };

  const handleCoreChange = (id: any) => {
    if (id && typeof id === 'string') {
      handleIndicatorSelect(id);
    }
  };

  const handleNodeSelect = (nodeId: string) => {
    navigate(`/detail/${nodeId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Error Loading Data</h2>
            <p className="text-gray-600 mt-2">{error.message}</p>
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

  const sunburstData = React.useMemo(() => {
    if (indicators.length > 0 && relationships.length > 0) {
      return transformToSunburstData(indicators, relationships);
    }
    return { nodes: [], links: [] };
  }, [indicators, relationships]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Community Ecosystem Overview</h1>
          <div className="flex gap-4">
            <EnhancedLocationPicker />
            <LLMContextToggle mode={llmMode} onModeChange={setLlmMode} />
          </div>
        </div>
        <p className="text-gray-600">
          Explore the interconnected relationships between different aspects of community wellbeing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Indicators</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicators.length}</div>
            <p className="text-xs text-muted-foreground">
              Measuring community aspects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationships.length}</div>
            <p className="text-xs text-muted-foreground">
              Mapped relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Community participants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Interactive Sunburst Visualization</CardTitle>
              <p className="text-sm text-gray-600">
                Click on any segment to explore that indicator in detail
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SunburstChart
                indicators={indicators}
                relationships={relationships}
                onCoreChange={handleCoreChange}
                onVisibleNodesChange={setVisibleNodes}
                onSelect={handleNodeSelect}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedIndicator && (
            <DescriptionPanel
              coreIndicator={selectedIndicator}
              indicators={indicators}
              relationships={relationships}
              visibleNodes={visibleNodes}
              llmMode={llmMode}
              mode="compact"
            />
          )}
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/treemap')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Tree Map View
                </Button>
                {selectedIndicator && (
                  <Button 
                    onClick={() => navigate(`/detail/${selectedIndicator.indicator_id}`)} 
                    className="w-full justify-start"
                  >
                    Explore {selectedIndicator.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

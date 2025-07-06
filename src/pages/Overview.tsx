
import React, { useEffect, useMemo, useState } from 'react';
import SunburstChart from '@/components/SunburstChart';
import DescriptionPanel from '@/components/DescriptionPanel';
import CommunityStories from '@/components/CommunityStories';
import SmartSearchBox from '@/components/SmartSearchBox';
import TargetLocationToggle from '@/components/TargetLocationToggle';
import { useEcosystem } from '@/context/EcosystemContext';
import { Indicator, SimulationModalState, SunburstNode } from '@/types';
import SimulationModal from '@/components/SimulationModal';
import SunburstFixModeToggle from '@/components/SunburstFixModeToggle';
import { transformToSunburstData } from '@/utils/indicatorUtils';
import { BarChart3, Users, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssociationSummaryCard from '@/components/AssociationSummaryCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import LLMContextToggle from '@/components/LLMContextToggle';


const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { indicators, relationships, loading, error } = useEcosystem();
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [simulationModal, setSimulationModal] = useState<SimulationModalState>({ isOpen: false, targetIndicatorId: undefined });
  const [isFixedMode, setIsFixedMode] = useState(false);
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
  const sunburstData = useMemo(() => {
    return transformToSunburstData(indicators, relationships);
  }, [indicators, relationships]);
  const [selectedCoreId, setSelectedCoreId] = useState<string | null>(null);
  const coreIndicator = useMemo(() => {
    return indicators.find(ind => ind.indicator_id === selectedCoreId);
  }, [selectedCoreId, indicators]);

  const features = [
      {
        icon: BarChart3,
        title: 'Interactive Sunburst Chart',
        description: 'Explore relationships between different wellbeing indicators through our dynamic visualization.',
        route: '/overview'
      },

      {
        icon: Users,
        title: 'Community Stories',
        description: 'Read real stories from community members about local initiatives and changes.',
        route: '/stories'
      },
      {
        icon: Target,
        title: 'Simulation Mode',
        description: 'Predict how changes in one indicator might affect others in your community.',
        route: () => {
          const wellbeingIndicator = indicators.find(ind => 
            ind.name.toLowerCase().includes('wellbeing')
          );
          return wellbeingIndicator 
            ? `/detail/${wellbeingIndicator.indicator_id}?simulate=true`
            : '/overview';
        }
      },
      {
        icon: TrendingUp,
        title: 'Historical Trends',
        description: 'Track progress over time and understand patterns in community wellbeing.',
        route: () => {
          const wellbeingIndicator = indicators.find(ind => 
            ind.name.toLowerCase().includes('wellbeing')
          );
          return wellbeingIndicator 
            ? `/research/${wellbeingIndicator.indicator_id}`
            : '/overview';
        }
      }
    ];

    const domains = [
      'Health & Wellness', 'Altruism', 'Purpose', 'Acommplishment',
      'Safety & Security', 'Information', 'Love & Interest', 'Dignity',
    ];

    const handleFeatureClick = (feature: typeof features[0]) => {
      const route = typeof feature.route === 'function' ? feature.route() : feature.route;
      navigate(route);
    };

    const handleDomainClick = (domainName: string) => {
      const matchingIndicator = indicators.find(ind => 
        ind.name.toLowerCase() === domainName.toLowerCase() ||
        ind.category.toLowerCase() === domainName.toLowerCase() ||
        ind.name.toLowerCase().includes(domainName.toLowerCase().split(' ')[0])
      );
      
      if (matchingIndicator) {
        navigate(`/research/${matchingIndicator.indicator_id}`);
      }
    };

useEffect(() => {
  // Ensure relationships is defined from context
  if (indicators.length > 0 && relationships && relationships.length > 0) {
    const allChildIds = new Set(relationships.map(r => r.child_id));
    const rootIndicator =
      indicators.find(ind => ind.name === 'Wellbeing') ||
      indicators.find(ind => !allChildIds.has(ind.indicator_id)) ||
      indicators[0];
    if (rootIndicator) {
      setSelectedCoreId(rootIndicator.indicator_id);
      if (rootIndicator.name === 'Wellbeing') {
        console.log("🌱 Root indicator set as:", rootIndicator.name);
      } else if (!allChildIds.has(rootIndicator.indicator_id)) {
        console.warn("⚠️ No 'Wellbeing' found, defaulted to orphan root:", rootIndicator.name);
      } else {
        console.warn("⚠️ No root found at all, defaulted to first indicator:", rootIndicator);
      }
    }
  }
}, [indicators, relationships]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform helps you understand how domains interact and 
                influence overall community health and happiness.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <SmartSearchBox onSelect={setSelectedIndicator} />
        </div>
        {/* What is Wellbeing Section */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Our Happiness?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                Community wellbeing encompasses the social, economic, environmental, cultural, 
                and political conditions that contribute to a thriving, sustainable community. 
                It's measured across multiple interconnected domains that influence each other.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

               {domains.map((domain, index) => {
                  const hasMatchingIndicator = indicators.some(ind => 
                    ind.name.toLowerCase() === domain.toLowerCase() ||
                    ind.category.toLowerCase() === domain.toLowerCase() ||
                    ind.name.toLowerCase().includes(domain.toLowerCase().split(' ')[0])
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDomainClick(domain)}
                      disabled={!hasMatchingIndicator}
                      className={`p-3 rounded-lg transition-colors ${
                        hasMatchingIndicator
                          ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer border border-gray-200'
                          : 'bg-gray-50 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        hasMatchingIndicator ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {domain}
                      </span>
                    </button>
                  );
                })}

              </div>

              <p className="text-gray-600">
                
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Panel - Sunburst */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="relative">
                <SunburstChart 
                  nodes={sunburstData.nodes}
                  links={sunburstData.links}
                  onCoreChange={(id) => setSelectedCoreId(id)}
                  onVisibleNodesChange={setVisibleNodes}
                  onSelect={(nodeId) => {
                    if (isFixedMode) {
                      setSimulationModal({ 
                        isOpen: true, 
                        targetIndicatorId: nodeId || undefined 
                      });
                    } else {
                      setSelectedCoreId(nodeId ?? null);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 space-y-6">
            {coreIndicator && (
              <DescriptionPanel
                coreIndicator={coreIndicator}
                indicators={indicators}
                relationships={relationships}
                visibleNodes={visibleNodes}
                llmMode="community"
              />
            )}
          </div>


        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800"></h3>
          <CommunityStories />
        </div>

        {/* Data Sources Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Data & Community Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Data Sources</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Government statistics and census data</li>
                    <li>• Community surveys and feedback</li>
                    <li>• Local organization reports</li>
                    <li>• Real-time community indicators</li>
                    <li>• Historical trend analysis</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Your Role</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Share your community stories</li>
                    <li>• Participate in local surveys</li>
                    <li>• Use insights for advocacy</li>
                    <li>• Connect with other community members</li>
                    <li>• Help validate and improve data</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">

                <p className="text-gray-600">
                  Explore how different aspects of wellbeing connect and influence each other in your community.
                </p>

              </div>
              <AssociationSummaryCard indicatorName={''} relatedIndicatorName={''} data={[]} averageStrength={0} totalResponses={0}/>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;

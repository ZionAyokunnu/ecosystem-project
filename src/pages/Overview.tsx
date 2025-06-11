
import React, { useState } from 'react';
import SunburstChart from '@/components/SunburstChart';
import DescriptionPanel from '@/components/DescriptionPanel';
import TrendGraph from '@/components/TrendGraph';
import Simulator from '@/components/Simulator';
import CommunityStories from '@/components/CommunityStories';
import SmartSearchBox from '@/components/SmartSearchBox';
import TargetLocationToggle from '@/components/TargetLocationToggle';
import SettingsDialog from '@/components/SettingsDialog';
import InfluenceMetricsComputer from '@/components/InfluenceMetricsComputer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useEcosystem } from '@/context/EcosystemContext';
import { Indicator, SimulationModalState } from '@/types';
import SimulationModal from '@/components/SimulationModal';
import SunburstFixModeToggle from '@/components/SunburstFixModeToggle';

const Overview = () => {
  const { indicators } = useEcosystem();
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [simulationModal, setSimulationModal] = useState<SimulationModalState>({ isOpen: false, targetIndicatorId: undefined });
  const [isFixedMode, setIsFixedMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Wellbeing Overview
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore how different aspects of wellbeing connect and influence each other in your community.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <SettingsDialog trigger={<button>Settings</button>} />
          <SmartSearchBox onSelect={setSelectedIndicator} />
          <TargetLocationToggle />
          <SunburstFixModeToggle 
            fixMode={isFixedMode} 
            onToggle={setIsFixedMode} 
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Breadcrumbs items={[]} onNavigate={() => {}} />
            <DescriptionPanel 
              indicators={indicators}
              selectedIndicator={selectedIndicator}
              onDescriptionUpdate={() => {}}
            />
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Influence Metrics</h3>
              <InfluenceMetricsComputer />
            </div>
          </div>

          {/* Center Panel - Sunburst */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="relative">
                <SunburstChart 
                  nodes={[]}
                  links={[]}
                  onSelect={(nodeId) => {
                    if (isFixedMode) {
                      setSimulationModal({ 
                        isOpen: true, 
                        targetIndicatorId: nodeId || undefined 
                      });
                    } else {
                      const indicator = indicators.find(i => i.indicator_id === nodeId);
                      if (indicator) {
                        setSelectedIndicator(indicator);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Trend Analysis</h3>
              <TrendGraph predictionData={[]} />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Simulation</h3>
              <Simulator 
                indicators={indicators}
                coreIndicator={selectedIndicator}
                onSimulate={() => {}}
                changes={[]}
                isLoading={false}
                simulationResult={null}
                onClearSimulation={() => {}}
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Community Stories</h3>
              <CommunityStories />
            </div>
          </div>
        </div>

        {simulationModal.isOpen && (
          <SimulationModal
            isOpen={simulationModal.isOpen}
            targetIndicatorId={simulationModal.targetIndicatorId}
            onClose={() => setSimulationModal({ isOpen: false, targetIndicatorId: undefined })}
          />
        )}
      </div>
    </div>
  );
};

export default Overview;

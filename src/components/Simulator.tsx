import React, { useState, useEffect } from 'react';
import { Indicator, SimulationChange } from '@/types';
import { getColorByValue } from '@/utils/indicatorUtils';
import { toast } from '@/components/ui/use-toast';

interface SimulatorProps {
  indicators: Indicator[];
  coreIndicator: Indicator;
  onSimulate: (indicatorId: string, newValue: number) => void;
  changes: SimulationChange[];
  onSaveSimulation: (name: string, description: string) => void;
  positiveDrivers: Indicator[];
  negativeDrivers: Indicator[];
}

const Simulator: React.FC<SimulatorProps> = ({
  indicators,
  coreIndicator,
  onSimulate,
  changes,
  onSaveSimulation,
  positiveDrivers,
  negativeDrivers
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [value, setValue] = useState<number>(50);
  const [simulationName, setSimulationName] = useState<string>('');
  const [simulationDesc, setSimulationDesc] = useState<string>('');
  
  // Reset value when selected indicator changes
  useEffect(() => {
    if (selectedIndicator) {
      const indicator = indicators.find(i => i.indicator_id === selectedIndicator);
      if (indicator) {
        setValue(indicator.current_value);
      }
    }
  }, [selectedIndicator, indicators]);
  
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue);
    if (selectedIndicator) {
      onSimulate(selectedIndicator, newValue);
    }
  };
  
  const handleSave = () => {
    if (!simulationName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for this simulation",
        variant: "destructive"
      });
      return;
    }
    
    onSaveSimulation(simulationName, simulationDesc);
    toast({
      title: "Simulation Saved",
      description: `"${simulationName}" has been saved successfully.`
    });
    setSimulationName('');
    setSimulationDesc('');
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">What-If Simulator</h2>
      
      <div className="mb-6">
        <label htmlFor="indicator-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select an Indicator to Adjust
        </label>
        <select
          id="indicator-select"
          value={selectedIndicator}
          onChange={(e) => setSelectedIndicator(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">-- Select Indicator --</option>
          {indicators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(indicator => (
              <option key={indicator.indicator_id} value={indicator.indicator_id}>
                {indicator.name} ({indicator.current_value.toFixed(1)})
              </option>
            ))}
        </select>
      </div>
      
      {selectedIndicator && (
        <div className="mb-6">
          <label htmlFor="value-slider" className="block text-sm font-medium text-gray-700 mb-1">
            Adjust Value: {value.toFixed(1)}
          </label>
          <input
            type="range"
            id="value-slider"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={handleValueChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${getColorByValue(0)}, ${getColorByValue(50)}, ${getColorByValue(100)})`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      )}
      
      {changes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Change Log</h3>
          <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Before</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changes.map((change, index) => {
                  const indicator = indicators.find(i => i.indicator_id === change.indicator_id);
                  const diff = change.new_value - change.previous_value;
                  return (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{indicator?.name || 'Unknown'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{change.previous_value.toFixed(1)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{change.new_value.toFixed(1)}</td>
                      <td className={`px-3 py-2 whitespace-nowrap text-sm ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {changes.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Simulation Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-1">Top Positive Effects</h4>
                {positiveDrivers.length === 0 ? (
                  <p className="text-gray-500 italic">No significant positive effects</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {positiveDrivers.map(driver => (
                      <li key={driver.indicator_id} className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                        <span>{driver.name} ({driver.current_value.toFixed(1)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-1">Top Negative Effects</h4>
                {negativeDrivers.length === 0 ? (
                  <p className="text-gray-500 italic">No significant negative effects</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {negativeDrivers.map(driver => (
                      <li key={driver.indicator_id} className="flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full mr-2 bg-red-500"></span>
                        <span>{driver.name} ({driver.current_value.toFixed(1)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Save This Simulation</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="simulation-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Name
                </label>
                <input
                  type="text"
                  id="simulation-name"
                  value={simulationName}
                  onChange={(e) => setSimulationName(e.target.value)}
                  placeholder="Enter a name for this simulation"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="simulation-desc" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="simulation-desc"
                  value={simulationDesc}
                  onChange={(e) => setSimulationDesc(e.target.value)}
                  placeholder="Brief description of the scenario"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleSave}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Simulation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Simulator;


import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, BarChart3, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEcosystem } from '@/context/EcosystemContext';
import { Indicator, Relationship } from '@/types';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIndicatorId: string;
  onViewChange?: () => void;
}

interface SimulationChange {
  indicatorId: string;
  originalValue: number;
  newValue: number;
  impact: number;
}

const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  targetIndicatorId,
  onViewChange
}) => {
  const { indicators, relationships } = useEcosystem();
  const [targetIndicator, setTargetIndicator] = useState<Indicator | null>(null);
  const [childIndicators, setChildIndicators] = useState<Indicator[]>([]);
  const [simulationChanges, setSimulationChanges] = useState<SimulationChange[]>([]);
  const [predictedParentValue, setPredictedParentValue] = useState<number>(0);

  useEffect(() => {
    if (!targetIndicatorId || indicators.length === 0) return;

    const target = indicators.find(ind => ind.indicator_id === targetIndicatorId);
    if (!target) return;

    setTargetIndicator(target);
    setPredictedParentValue(target.current_value);

    // Find child indicators
    const childRelationships = relationships.filter(rel => rel.parent_id === targetIndicatorId);
    const children = childRelationships
      .map(rel => indicators.find(ind => ind.indicator_id === rel.child_id))
      .filter((ind): ind is Indicator => !!ind);

    setChildIndicators(children);

    // Initialize simulation changes
    const initialChanges = children.map(child => ({
      indicatorId: child.indicator_id,
      originalValue: child.current_value,
      newValue: child.current_value,
      impact: 0
    }));
    setSimulationChanges(initialChanges);
  }, [targetIndicatorId, indicators, relationships]);

  const handleValueChange = (indicatorId: string, newValues: number[]) => {
    const newValue = newValues[0];
    const change = simulationChanges.find(c => c.indicatorId === indicatorId);
    if (!change) return;

    const updatedChanges = simulationChanges.map(c => 
      c.indicatorId === indicatorId 
        ? { ...c, newValue, impact: newValue - c.originalValue }
        : c
    );
    setSimulationChanges(updatedChanges);

    // Calculate predicted parent value based on influence weights
    let totalWeightedChange = 0;
    let totalWeight = 0;

    updatedChanges.forEach(change => {
      const relationship = relationships.find(rel => 
        rel.parent_id === targetIndicatorId && rel.child_id === change.indicatorId
      );
      if (relationship) {
        const weight = relationship.influence_score || 0.1;
        totalWeightedChange += change.impact * weight;
        totalWeight += weight;
      }
    });

    const averageChange = totalWeight > 0 ? totalWeightedChange / totalWeight : 0;
    const newParentValue = Math.max(0, Math.min(100, (targetIndicator?.current_value || 0) + averageChange));
    setPredictedParentValue(newParentValue);
  };

  const resetSimulation = () => {
    const resetChanges = simulationChanges.map(change => ({
      ...change,
      newValue: change.originalValue,
      impact: 0
    }));
    setSimulationChanges(resetChanges);
    setPredictedParentValue(targetIndicator?.current_value || 0);
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp className="w-4 h-4" />;
    if (impact < 0) return <TrendingDown className="w-4 h-4" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  if (!targetIndicator) return null;

  const hasChanges = simulationChanges.some(change => change.impact !== 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Simulation: {targetIndicator.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parent Indicator Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Predicted Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="text-2xl font-bold">{targetIndicator.current_value.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Predicted Value</p>
                  <p className="text-2xl font-bold text-gray-600">{predictedParentValue.toFixed(1)}%</p>
                  <div className={`flex items-center justify-center gap-1 ${getImpactColor(predictedParentValue - targetIndicator.current_value)}`}>
                    {getImpactIcon(predictedParentValue - targetIndicator.current_value)}
                    <span className="text-sm font-medium">
                      {predictedParentValue - targetIndicator.current_value > 0 ? '+' : ''}
                      {(predictedParentValue - targetIndicator.current_value).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Child Indicators Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Adjust Contributing Factors</h3>
              <Button variant="outline" size="sm" onClick={resetSimulation}>
                Reset All
              </Button>
            </div>

            {childIndicators.map(child => {
              const change = simulationChanges.find(c => c.indicatorId === child.indicator_id);
              if (!change) return null;

              const relationship = relationships.find(rel => 
                rel.parent_id === targetIndicatorId && rel.child_id === child.indicator_id
              );
              const influence = relationship?.influence_score || 0.1;

              return (
                <Card key={child.indicator_id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{child.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{child.category}</Badge>
                            <span className="text-sm text-gray-500">
                              Influence: {(influence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{change.newValue.toFixed(1)}</p>
                          <div className={`flex items-center gap-1 ${getImpactColor(change.impact)}`}>
                            {getImpactIcon(change.impact)}
                            <span className="text-sm">
                              {change.impact > 0 ? '+' : ''}{change.impact.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[change.newValue]}
                          onValueChange={(values) => handleValueChange(child.indicator_id, values)}
                          max={100}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>Original: {change.originalValue.toFixed(1)}</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {childIndicators.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Contributing Factors</h3>
                <p className="text-gray-500">
                  This indicator doesn't have any child indicators to simulate.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex gap-2">
              {hasChanges && onViewChange && (
                <Button
                  variant="outline"
                  onClick={onViewChange}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Changes
                </Button>
              )}
              <Button disabled={childIndicators.length === 0}>
                Save Scenario
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimulationModal;
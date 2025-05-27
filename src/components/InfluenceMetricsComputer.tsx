
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Play, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ComputationSummary {
  totalIndicators: number;
  validIndicators: number;
  totalRelationships: number;
  updatedRelationships: number;
  skippedRelationships: number;
  influenceScoreRange: { min: number; max: number };
  influenceWeightRange: { min: number; max: number };
}

const InfluenceMetricsComputer: React.FC = () => {
  const [isComputing, setIsComputing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; summary?: ComputationSummary; error?: string } | null>(null);
  const [progress, setProgress] = useState(0);

  const runComputation = async () => {
    console.log('InfluenceMetricsComputer: runComputation started');
    setIsComputing(true);
    setResult(null);
    setProgress(0);
    console.log('InfluenceMetricsComputer: state reset, starting progress simulation');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = Math.min(prev + 10, 90);
          console.log(`InfluenceMetricsComputer: progress → ${next}`);
          return next;
        });
      }, 500);

      console.log('InfluenceMetricsComputer: invoking compute-influence-metrics function');
      const { data, error } = await supabase.functions.invoke('compute-influence-metrics', {
        body: {}
      });
      console.log('InfluenceMetricsComputer: function response', { data, error });

      clearInterval(progressInterval);
      setProgress(100);
      console.log('InfluenceMetricsComputer: progress complete, setting to 100');

      if (error) {
        throw error;
      }

      console.log('InfluenceMetricsComputer: computation successful, data:', data);
      setResult(data);
    } catch (error) {
      console.error('Failed to compute influence metrics:', error);
      console.log('InfluenceMetricsComputer: computation error caught', error);
      setResult({
        success: false,
        error: error.message || 'Failed to compute influence metrics'
      });
    } finally {
      setIsComputing(false);
      console.log('InfluenceMetricsComputer: runComputation finished, isComputing →', false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Influence Metrics Computer
        </CardTitle>
        <CardDescription>
          Compute and update correlation-based influence scores and OLS-based influence weights for all ecosystem indicators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fetches all indicators and their historical trends from Supabase</li>
              <li>Performs z-score normalization on indicator values</li>
              <li>Computes influence scores based on correlation between sibling indicators</li>
              <li>Computes influence weights using OLS regression with 1-year lag</li>
              <li>Updates the relationships table with the computed values</li>
            </ul>
          </div>

          {isComputing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Computing influence metrics...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {result && (
            <Alert className={result.success ? "border-green-500" : "border-red-500"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  {result.success ? (
                    <div className="space-y-2">
                      <p className="font-medium">Computation completed successfully!</p>
                      {result.summary && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Indicators:</strong> {result.summary.validIndicators}/{result.summary.totalIndicators} valid</p>
                            <p><strong>Relationships:</strong> {result.summary.updatedRelationships}/{result.summary.totalRelationships} updated</p>
                          </div>
                          <div>
                            <p><strong>Influence Score Range:</strong> {result.summary.influenceScoreRange.min.toFixed(3)} - {result.summary.influenceScoreRange.max.toFixed(3)}</p>
                            <p><strong>Influence Weight Range:</strong> {result.summary.influenceWeightRange.min.toFixed(1)} - {result.summary.influenceWeightRange.max.toFixed(1)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-700">Error: {result.error}</p>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Button 
            onClick={runComputation} 
            disabled={isComputing}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {isComputing ? 'Computing...' : 'Run Computation'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfluenceMetricsComputer;
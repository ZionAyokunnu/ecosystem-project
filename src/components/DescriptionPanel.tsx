
import React, { useState, useEffect } from 'react';
import { Indicator, SunburstNode, Relationship } from '@/types';
import { useDriverComputation } from '@/hooks/useDriverComputation';
import { useRecommendations } from '@/hooks/useRecommendations';
import { queryLocalLLM } from '@/services/localLLM';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';



interface DescriptionPanelProps {
  coreIndicator: Indicator;
  indicators: Indicator[];
  relationships: Relationship[];
  visibleNodes: SunburstNode[];
  correlations?: Record<string, number>;
  llmMode?: 'business' | 'community';
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({
  coreIndicator,
  indicators,
  relationships,
  visibleNodes,
  correlations = {},
  llmMode = 'business'
}) => {
  // Debug: log inputs at the very top of the component
  console.log('🔍 [DescriptionPanel] inputs:', {
    core: coreIndicator.indicator_id,
    visibleNodeIds: visibleNodes.map(n => n.id),
    llmMode,
    laggingIds: (() => {
      // We need to call useDriverComputation here, but it's below. So, for correct order, move this log after laggingDrivers is available.
      return undefined;
    })(),
    thrivingIds: (() => undefined)(),
  });
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Use localIndicators if present, otherwise fallback to indicators
  const localIndicators = (typeof (window as any).localIndicators !== "undefined")
    ? (window as any).localIndicators
    : indicators;

  // Compute dynamic drivers using localIndicators (simulation-adjusted)
  const { laggingDrivers, thrivingDrivers, visibleLinkedIndicators } = useDriverComputation(
    coreIndicator,
    localIndicators || [],
    relationships || [],
    visibleNodes || []
  );
  // Debug: log inputs with drivers after computation
  console.log('🔍 [DescriptionPanel] inputs:', {
    core: coreIndicator.indicator_id,
    visibleNodeIds: visibleNodes.map(n => n.id),
    laggingIds: laggingDrivers.map(d => d.indicator_id),
    thrivingIds: thrivingDrivers.map(d => d.indicator_id),
  });

  // Generate recommendations using localIndicators (simulation-adjusted)
  const recommendations = useRecommendations(
    laggingDrivers || [],
    thrivingDrivers || [],
    localIndicators || [],
    relationships || []
  );

  // Generate LLM analysis
  useEffect(() => {
    const generateAnalysis = async () => {
      if (!coreIndicator) return;
      
      setIsLoadingAnalysis(true);
      try {
        const thrivingNames = (thrivingDrivers || []).map(d => d.name).join(', ');
        const laggingNames = (laggingDrivers || []).map(d => d.name).join(', ');
        
        const prompt = `Provide a concise, one-sentence recommendation and analysis of the current state and trends for "${coreIndicator.name}", whose current value is ${coreIndicator.current_value.toFixed(1)}. Indicate whether this value appears to be improving, declining, or stable. 
                        Draw insightfully on its relationships with its thriving indicators (${thrivingNames}) with values [${thrivingDrivers.map(d => d.current_value.toFixed(1)).join(', ')}] which has bolstered its value and the 3 most-lagging indicators (${laggingNames}) with values [${laggingDrivers.map(d => d.current_value.toFixed(1)).join(', ')}] brought down its value.'
                        Use language appropriate to the domain and communicate with an engaging, urgent, and motivating tone to communicate, celebrate (thriving associated indicators that bolstered it value and call to urgent action to address lagging associated indicators that had brought it value down so as to bring the value up) Avoid generic or vague phrasing.`;
        
        const analysis = await queryLocalLLM(prompt, llmMode);
        setAnalysisText(analysis);
      } catch (error) {
        console.error('Failed to generate LLM analysis:', error);
        setAnalysisText(`Analysis of current state and trends for ${coreIndicator.name}.`);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    if (coreIndicator && (thrivingDrivers?.length > 0 || laggingDrivers?.length > 0)) {
      generateAnalysis();
    } else if (coreIndicator) {
      setAnalysisText(`Analysis of current state and trends for ${coreIndicator.name}.`);
    }
  }, [coreIndicator, thrivingDrivers, laggingDrivers, llmMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return if no core indicator
  if (!coreIndicator) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }


  // Generate LLM analysis
  useEffect(() => {
    const generateAnalysis = async () => {
      if (!coreIndicator) return;
      
      setIsLoadingAnalysis(true);
      try {
        const thrivingNames = (thrivingDrivers || []).map(d => d.name).join(', ');
        const laggingNames = (laggingDrivers || []).map(d => d.name).join(', ');
        
        const prompt = `Provide a concise, one-sentence analysis of the current state and trends for "${coreIndicator.name}", drawing on its relationships with the 3 highest indicators (${thrivingNames}) and 3 lowest indicators (${laggingNames}). Use domain-relevant language and avoid generic phrasing.`;
        
        const analysis = await queryLocalLLM(prompt);
        setAnalysisText(analysis);
      } catch (error) {
        console.error('Failed to generate LLM analysis:', error);
        setAnalysisText(`Analysis of current state and trends for ${coreIndicator.name}.`);
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    if (coreIndicator && (thrivingDrivers?.length > 0 || laggingDrivers?.length > 0)) {
      generateAnalysis();
    } else if (coreIndicator) {
      setAnalysisText(`Analysis of current state and trends for ${coreIndicator.name}.`);
    }
  }, [coreIndicator, thrivingDrivers, laggingDrivers]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return if no core indicator
  if (!coreIndicator) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const renderIndicatorList = (indicators: Indicator[], type: 'positive' | 'negative') => {
    if (!indicators || !indicators || indicators.length === 0) {
      return <p className="text-gray-500 italic">No {type === 'positive' ? 'thriving' : 'lagging'} drivers identified.</p>;
    }
    
    return (
      <ul className="mt-1 space-y-1">
        {indicators.map((indicator, index) => {
          const correlation = correlations[indicator.indicator_id];
          const correlationText = correlation !== undefined 
            ? ` (${(correlation * 100).toFixed(1)}%)` 
            : '';
          
          return (
            <li 
              key={indicator.indicator_id} 
              className={`flex items-center transition-opacity duration-300 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                type === 'positive' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span>
                {indicator.name} ({indicator.current_value.toFixed(1)})
                <span className="text-gray-500 text-sm">{correlationText}</span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  return (
    <TooltipProvider>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{coreIndicator.name} Overview</h2>
          <div className="flex items-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ 
                background: coreIndicator.current_value > 66 
                  ? 'linear-gradient(to right, #00b09b, #96c93d)' 
                  : coreIndicator.current_value > 33 
                    ? 'linear-gradient(to right, #ff9966, #ff5e62)' 
                    : 'linear-gradient(to right, #cb2d3e, #ef473a)' 
              }}
            >
              {coreIndicator.current_value.toFixed(1)}
            </div>
            <div className="ml-4">
              {isLoadingAnalysis ? (
                <Skeleton className="h-4 w-80" />
              ) : (
               <div>
                  <p className="text-gray-600">{analysisText}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Perspective: {llmMode === 'business' ? 'Business Stakeholder' : 'Community Member'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-green-700 mb-1">Thriving Drivers</h3>
            {renderIndicatorList(thrivingDrivers || [], 'positive')}
          </div>
          <div>
            <h3 className="font-medium text-red-700 mb-1">Lagging Drivers</h3>
            {renderIndicatorList(laggingDrivers || [], 'negative')}
          </div>
        </div>
        
        {recommendations && recommendations.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Your data-driven insights:</h3>
            <ul className="space-y-2 text-gray-600">
              {recommendations.map((rec, index) => (
                <li 
                  key={index} 
                  className={`flex items-start gap-2 transition-opacity duration-300 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${(index + 3) * 100}ms` }}
                >
                  <span className="text-blue-600 font-medium">•</span>
                  <span className="flex-1">{rec}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 mt-0.5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Based on analysis of {visibleLinkedIndicators?.length || 0} connected indicators</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TooltipProvider>
     );
};

export default DescriptionPanel;

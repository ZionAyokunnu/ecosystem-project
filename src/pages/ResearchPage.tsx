
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEcosystem } from '@/context/EcosystemContext';
import { useLocation } from '@/context/LocationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Target, Brain } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Indicator, Relationship } from '@/types';
import { getTopDrivers } from '@/utils/indicatorUtils';
import PredictionChart from '@/components/PredictionChart';
import ComparativeAnalysis from '@/components/ComparativeAnalysis';
import InsightsPanel from '@/components/InsightsPanel';

const ResearchPage: React.FC = () => {
  const { indicatorId } = useParams<{ indicatorId: string }>();
  const navigate = useNavigate();
  const { indicators, relationships, loading } = useEcosystem();
  const { selectedLocation } = useLocation();
  
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [topDrivers, setTopDrivers] = useState<{
    positiveDrivers: Indicator[],
    negativeDrivers: Indicator[]
  }>({ positiveDrivers: [], negativeDrivers: [] });

  useEffect(() => {
    if (indicatorId && indicators.length > 0) {
      const found = indicators.find(ind => ind.indicator_id === indicatorId);
      setIndicator(found || null);
      
      if (found) {
        const drivers = getTopDrivers(indicatorId, indicators, relationships, 5);
        setTopDrivers(drivers);
      }
    }
  }, [indicatorId, indicators, relationships]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Indicator Not Found</h1>
        <Button onClick={() => navigate('/')}>Return to Overview</Button>
      </div>
    );
  }

  // Mock historical data for demonstration
  const historicalData = Array.from({ length: 10 }, (_, i) => ({
    year: 2015 + i,
    value: indicator.current_value + (Math.random() - 0.5) * 20,
  }));

  const driverData = [
    ...topDrivers.positiveDrivers.map(d => ({
      name: d.name.slice(0, 20) + '...',
      value: d.current_value,
      type: 'positive'
    })),
    ...topDrivers.negativeDrivers.map(d => ({
      name: d.name.slice(0, 20) + '...',
      value: -d.current_value,
      type: 'negative'
    }))
  ].slice(0, 10);

    // Mock data for advanced analytics
  const predictionData = Array.from({ length: 15 }, (_, i) => {
    const year = 2020 + i;
    const currentYear = new Date().getFullYear();
    const isPrediction = year > currentYear;
    const baseValue = indicator.current_value;
    const trend = Math.sin((i - 5) * 0.3) * 10 + baseValue;
    
    return {
      year,
      historical: !isPrediction ? trend + (Math.random() - 0.5) * 5 : undefined,
      predicted: trend + (Math.random() - 0.5) * 3,
      confidence_low: trend - 8,
      confidence_high: trend + 8,
      is_prediction: isPrediction
    };
  });

  const comparisonData = [
    {
      location: selectedLocation?.name || 'Current Location',
      current_value: indicator.current_value,
      benchmark: 75,
      difference: indicator.current_value - 75,
      rank: 3
    },
    {
      location: 'Regional Average',
      current_value: 72,
      benchmark: 75,
      difference: -3,
      rank: 4
    },
    {
      location: 'National Average',
      current_value: 68,
      benchmark: 75,
      difference: -7,
      rank: 6
    },
    {
      location: 'Best Performing',
      current_value: 85,
      benchmark: 75,
      difference: 10,
      rank: 1
    },
    {
      location: 'Peer Location A',
      current_value: 78,
      benchmark: 75,
      difference: 3,
      rank: 2
    }
  ];

  const aiInsights = [
    {
      type: 'recommendation' as const,
      title: 'Focus on Infrastructure Development',
      description: 'Analysis shows that improving local infrastructure could increase this indicator by 12-15% within 18 months.',
      confidence: 0.87,
      impact: 'high' as const,
      timeframe: '18 months',
      actions: [
        'Increase public transportation accessibility',
        'Improve digital infrastructure coverage',
        'Enhance community facilities'
      ]
    },
    {
      type: 'prediction' as const,
      title: 'Positive Trend Expected',
      description: 'Based on current patterns and planned initiatives, this indicator is likely to improve by 8% over the next 2 years.',
      confidence: 0.73,
      impact: 'medium' as const,
      timeframe: '24 months'
    },
    {
      type: 'correlation' as const,
      title: 'Strong Link to Education Outcomes',
      description: 'There is a 0.82 correlation between this indicator and local education quality metrics.',
      confidence: 0.92,
      impact: 'high' as const,
      actions: [
        'Coordinate with education department',
        'Implement joint improvement programs'
      ]
    }
  ];

  const prediction = {
    trend: indicator.current_value > 60 ? 'increasing' as const : 'stable' as const,
    confidence: 0.78,
    factors: ['Economic Development', 'Population Growth', 'Policy Changes', 'Infrastructure Investment']
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{indicator.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{indicator.category}</Badge>
            <Badge variant="outline">
              Current: {indicator.current_value.toFixed(1)}
            </Badge>
            {selectedLocation && (
              <Badge variant="outline">
                Location: {selectedLocation.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Historical</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Definition & Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {indicator.description || `${indicator.name} is a key indicator measuring aspects of community wellbeing in the ${indicator.category} domain. This metric helps track progress and identify areas for improvement.`}
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Current Score</h4>
                  <p className="text-2xl font-bold text-blue-600">{indicator.current_value.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Domain</h4>
                  <p className="text-lg font-medium text-green-600">{indicator.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relationship Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This indicator has relationships with {relationships.filter(r => r.parent_id === indicator.indicator_id || r.child_id === indicator.indicator_id).length} other indicators.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Influences:</h4>
                  <ul className="space-y-1">
                    {relationships
                      .filter(r => r.parent_id === indicator.indicator_id)
                      .slice(0, 3)
                      .map(rel => {
                        const child = indicators.find(i => i.indicator_id === rel.child_id);
                        return child ? (
                          <li key={rel.relationship_id} className="text-sm text-gray-600">
                            • {child.name} ({(rel.influence_score * 100).toFixed(1)}%)
                          </li>
                        ) : null;
                      })}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Influenced by:</h4>
                  <ul className="space-y-1">
                    {relationships
                      .filter(r => r.child_id === indicator.indicator_id)
                      .slice(0, 3)
                      .map(rel => {
                        const parent = indicators.find(i => i.indicator_id === rel.parent_id);
                        return parent ? (
                          <li key={rel.relationship_id} className="text-sm text-gray-600">
                            • {parent.name} ({(rel.influence_score * 100).toFixed(1)}%)
                          </li>
                        ) : null;
                      })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: indicator.name,
                    color: "#8884d8"
                  }
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <PredictionChart
            data={predictionData}
            indicatorName={indicator.name}
            currentValue={indicator.current_value}
            prediction={prediction}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <ComparativeAnalysis
            data={comparisonData}
            indicatorName={indicator.name}
            selectedLocation={selectedLocation?.name}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsPanel
            insights={aiInsights}
            indicatorName={indicator.name}
            onImplementAction={(action) => {
              console.log('Implementing action:', action);
              // Here you would integrate with actual implementation systems
            }}
          />
          </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Key Drivers Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Top Positive Drivers
                  </h3>
                  <div className="space-y-3">
                    {topDrivers.positiveDrivers.slice(0, 5).map((driver, index) => (
                      <div key={driver.indicator_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900">{driver.name}</p>
                          <p className="text-sm text-green-600">{driver.category}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {driver.current_value.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Areas for Improvement
                  </h3>
                  <div className="space-y-3">
                    {topDrivers.negativeDrivers.slice(0, 5).map((driver, index) => (
                      <div key={driver.indicator_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-red-900">{driver.name}</p>
                          <p className="text-sm text-red-600">{driver.category}</p>
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {driver.current_value.toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Key Finding</h4>
                    <p className="text-blue-800">
                      Based on correlation analysis, {indicator.name} shows strong positive correlation with {topDrivers.positiveDrivers[0]?.name || 'related indicators'} in the current location context.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Recommendation</h4>
                    <p className="text-yellow-800">
                      Focus on improving {topDrivers.negativeDrivers[0]?.name || 'underperforming areas'} to see the most significant impact on {indicator.name}.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Trend Prediction</h4>
                    <p className="text-purple-800">
                      Current trajectory suggests {indicator.current_value > 60 ? 'continued improvement' : 'opportunity for growth'} with targeted interventions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collaboration Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Potential Stakeholders</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Local Government Agencies</li>
                      <li>• Community Organizations</li>
                      <li>• Educational Institutions</li>
                      <li>• Healthcare Providers</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Collaborative Domains</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Data Collection & Analysis</li>
                      <li>• Community Engagement</li>
                      <li>• Policy Development</li>
                      <li>• Resource Allocation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearchPage;
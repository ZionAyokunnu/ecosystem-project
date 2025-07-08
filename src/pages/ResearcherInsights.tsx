
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useEcosystem } from '@/context/EcosystemContext';
import { TrendingUp, Users, FileText, Filter, FileQuestion } from 'lucide-react';
import AssociationSummaryCard from '@/components/AssociationSummaryCard';
import SurveyCreationForm from '@/components/SurveyCreationForm';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InsightData {
  parent_id: string;
  child_id: string;
  parent_name: string;
  child_name: string;
  response_count: number;
  avg_strength: number;
  directions: Record<string, number>;
}

const ResearcherInsights = () => {
  const { indicators } = useEcosystem();
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const domains = ['all', 'Health', 'Education', 'Economy', 'Environment', 'Social'];

  useEffect(() => {
    if (selectedIndicator) {
      fetchInsights();
    }
  }, [selectedIndicator, filterDomain]);

  const fetchInsights = async () => {
    if (!selectedIndicator) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('relationship_user_responses')
        .select(`
          parent_id,
          child_id,
          strength_score,
          direction,
          domain,
          indicators!parent_id(name),
          child_indicators:indicators!child_id(name)
        `)
        .or(`parent_id.eq.${selectedIndicator},child_id.eq.${selectedIndicator}`);

      if (filterDomain !== 'all') {
        query = query.eq('domain', filterDomain);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data
      const groupedData = data?.reduce((acc: Record<string, any>, response: any) => {
        const isParent = response.parent_id === selectedIndicator;
        const otherIndicatorId = isParent ? response.child_id : response.parent_id;
        const key = `${response.parent_id}-${response.child_id}`;

        if (!acc[key]) {
          acc[key] = {
            parent_id: response.parent_id,
            child_id: response.child_id,
            parent_name: response.indicators?.name || 'Unknown',
            child_name: response.child_indicators?.name || 'Unknown',
            responses: [],
            directions: { 'A→B': 0, 'B→A': 0, 'Mutual': 0, 'Unclear': 0 }
          };
        }

        acc[key].responses.push(response.strength_score);
        acc[key].directions[response.direction]++;

        return acc;
      }, {}) || {};

      const processedInsights = Object.values(groupedData).map((group: any) => ({
        ...group,
        response_count: group.responses.length,
        avg_strength: group.responses.reduce((sum: number, score: number) => sum + score, 0) / group.responses.length
      })) as InsightData[];

      setInsights(processedInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedIndicatorData = indicators.find(i => i.indicator_id === selectedIndicator);

  const chartData = insights.map(insight => ({
    relationship: `${insight.parent_name} → ${insight.child_name}`,
    responses: insight.response_count,
    avgStrength: Math.round(insight.avg_strength * 10) / 10
  }));

  const directionData = insights.reduce((acc, insight) => {
    Object.entries(insight.directions).forEach(([direction, count]) => {
      const existing = acc.find(item => item.direction === direction);
      if (existing) {
        existing.count += count;
      } else {
        acc.push({ direction, count });
      }
    });
    return acc;
  }, [] as { direction: string; count: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Replace the stub callback with a real handler
  const handleSurveyCreated = (surveyId: string) => {
    console.log('✅ New survey created:', surveyId);
    // TODO: refresh insights or navigate to the new survey
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Insights Dashboard</h1>
          <p className="text-gray-600">Analyse community perceptions of indicator relationships</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-6">
              <FileQuestion className="mr-2 h-4 w-4" />
              New Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Survey</DialogTitle>
            </DialogHeader>
            <SurveyCreationForm
              onSurveyCreated={handleSurveyCreated}
              indicators={[]}
            />
            <DialogClose asChild>
              <Button variant="ghost" className="mt-4">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Indicator
            </label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an indicator to analyze" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map(indicator => (
                  <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                    {indicator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Domain
            </label>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {domains.map(domain => (
                  <SelectItem key={domain} value={domain}>
                    {domain === 'all' ? 'All Domains' : domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedIndicator && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Relationships</p>
                      <p className="text-2xl font-bold text-blue-600">{insights.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Responses</p>
                      <p className="text-2xl font-bold text-green-600">
                        {insights.reduce((sum, insight) => sum + insight.response_count, 0)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Strength</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {insights.length > 0 
                          ? Math.round((insights.reduce((sum, insight) => sum + insight.avg_strength, 0) / insights.length) * 10) / 10
                          : 0
                        }
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Response Count Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Volume by Relationship</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="relationship" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={10}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="responses" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Direction Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Perceived Direction Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={directionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ direction, count }) => `${direction}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {directionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed Table */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Relationship Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-left">Relationship</th>
                            <th className="border border-gray-300 p-2 text-center">Responses</th>
                            <th className="border border-gray-300 p-2 text-center">Avg Strength</th>
                            <th className="border border-gray-300 p-2 text-center">A→B</th>
                            <th className="border border-gray-300 p-2 text-center">B→A</th>
                            <th className="border border-gray-300 p-2 text-center">Mutual</th>
                            <th className="border border-gray-300 p-2 text-center">Unclear</th>
                          </tr>
                        </thead>
                        <tbody>
                          {insights.map((insight, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2">
                                {insight.parent_name} → {insight.child_name}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {insight.response_count}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {Math.round(insight.avg_strength * 10) / 10}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {insight.directions['A→B'] || 0}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {insight.directions['B→A'] || 0}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {insight.directions['Mutual'] || 0}
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {insight.directions['Unclear'] || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <div>
                    <AssociationSummaryCard
                      indicatorName={selectedIndicatorData?.name || 'Unknown'}
                      relatedIndicatorName="N/A"
                      data={(() => {
                        const total = insights.reduce(
                          (sum, insight) =>
                            sum +
                            (insight.directions['A→B'] || 0) +
                            (insight.directions['B→A'] || 0) +
                            (insight.directions['Mutual'] || 0) +
                            (insight.directions['Unclear'] || 0),
                          0
                        );
                        const directions = ['A→B', 'B→A', 'Mutual', 'Unclear'];
                        return directions.map(direction => {
                          const count = insights.reduce(
                            (sum, insight) => sum + (insight.directions[direction] || 0),
                            0
                          );
                          return {
                            direction,
                            count,
                            percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0
                          };
                        });
                      })()}
                      averageStrength={
                        insights.length > 0 
                          ? Math.round((insights.reduce((sum, insight) => sum + insight.avg_strength, 0) / insights.length) * 10) / 10
                          : 0
                      }
                      totalResponses={insights.reduce((sum, insight) => sum + insight.response_count, 0)}
                    />
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResearcherInsights;

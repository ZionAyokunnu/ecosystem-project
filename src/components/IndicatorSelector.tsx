
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEcosystem } from '@/context/EcosystemContext';
import { Indicator } from '@/types';

interface IndicatorSelectorProps {
  onIndicatorSelect: (indicatorId: string) => void;
  currentIndicatorId?: string;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  onIndicatorSelect,
  currentIndicatorId
}) => {
  const { indicators } = useEcosystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(indicators.map(ind => ind.category))];
    return ['all', ...uniqueCategories];
  }, [indicators]);
  
  const filteredIndicators = useMemo(() => {
    return indicators.filter(indicator => {
      const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           indicator.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || indicator.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [indicators, searchTerm, selectedCategory]);
  
  const handleQuickSelect = (indicatorId: string) => {
    onIndicatorSelect(indicatorId);
  };
  
  // Get top indicators by value for quick access
  const topIndicators = useMemo(() => {
    return [...indicators]
      .sort((a, b) => b.current_value - a.current_value)
      .slice(0, 5);
  }, [indicators]);
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <h3 className="font-medium text-gray-900">Find Indicator</h3>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search indicators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {searchTerm && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredIndicators.map(indicator => (
              <Button
                key={indicator.indicator_id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start h-auto p-2 ${
                  currentIndicatorId === indicator.indicator_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleQuickSelect(indicator.indicator_id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{indicator.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {indicator.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">{indicator.current_value.toFixed(1)}</span>
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {!searchTerm && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Top Performing
          </h4>
          <div className="space-y-1">
            {topIndicators.map(indicator => (
              <Button
                key={indicator.indicator_id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start h-auto p-2 ${
                  currentIndicatorId === indicator.indicator_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleQuickSelect(indicator.indicator_id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{indicator.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      indicator.current_value > 75 ? 'bg-green-100 text-green-800' :
                      indicator.current_value > 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {indicator.current_value.toFixed(1)}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorSelector;
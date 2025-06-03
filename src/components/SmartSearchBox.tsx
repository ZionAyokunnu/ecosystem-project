
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, BookOpen, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEcosystem } from '@/context/EcosystemContext';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'indicator' | 'category' | 'research';
  id: string;
  title: string;
  description: string;
  category?: string;
  value?: number;
  action: string;
  actionUrl: string;
}

const SmartSearchBox: React.FC = () => {
  const { indicators } = useEcosystem();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    
    // Search indicators
    indicators.forEach(indicator => {
      if (
        indicator.name.toLowerCase().includes(queryLower) ||
        indicator.category.toLowerCase().includes(queryLower) ||
        indicator.description?.toLowerCase().includes(queryLower)
      ) {
        results.push({
          type: 'indicator',
          id: indicator.indicator_id,
          title: indicator.name,
          description: indicator.description || `Explore ${indicator.name} data and trends`,
          category: indicator.category,
          value: indicator.current_value,
          action: 'View Chart',
          actionUrl: `/detail/${indicator.indicator_id}`
        });
      }
    });
    
    // Search categories
    const categories = [...new Set(indicators.map(ind => ind.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        const categoryIndicators = indicators.filter(ind => ind.category === category);
        results.push({
          type: 'category',
          id: category,
          title: `${category} Indicators`,
          description: `Explore all ${categoryIndicators.length} indicators in ${category}`,
          action: 'Browse Category',
          actionUrl: `/?category=${encodeURIComponent(category)}`
        });
      }
    });
    
    // Mock research results
    if (queryLower.includes('wellbeing') || queryLower.includes('health') || queryLower.includes('education')) {
      results.push({
        type: 'research',
        id: 'research-' + queryLower,
        title: `Research: ${query} Impact Studies`,
        description: `Latest research and evidence on ${query} in community development`,
        action: 'Read Research',
        actionUrl: `/research?topic=${encodeURIComponent(query)}`
      });
    }
    
    return results.slice(0, 6); // Limit results
  }, [query, indicators]);
  
  const handleResultClick = (result: SearchResult) => {
    navigate(result.actionUrl);
    setQuery('');
    setIsExpanded(false);
  };
  
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'indicator':
        return <TrendingUp className="w-4 h-4" />;
      case 'category':
        return <Search className="w-4 h-4" />;
      case 'research':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="What do you want to explore? (e.g., 'health outcomes', 'education', 'wellbeing')"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsExpanded(!!e.target.value);
          }}
          className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
          onFocus={() => setIsExpanded(!!query)}
          onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
        />
      </div>
      
      {isExpanded && searchResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-xl border-2">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === searchResults.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-blue-600">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          {result.category && (
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                          {result.value !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {result.value.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{result.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      {result.action}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {isExpanded && searchResults.length === 0 && query.trim() && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-xl border-2">
          <CardContent className="p-4 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No results found for "{query}"</p>
            <p className="text-sm mt-1">Try searching for indicators, categories, or topics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartSearchBox;
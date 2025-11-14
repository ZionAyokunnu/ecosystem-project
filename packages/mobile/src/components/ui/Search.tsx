import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, FlatList } from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Text } from './Text';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';

interface SearchProps<T> {
  data: T[];
  onSearch: (results: T[]) => void;
  searchKeys: (keyof T)[];
  placeholder?: string;
  categories?: SearchCategory[];
  onItemPress?: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
  debounceMs?: number;
}

interface SearchCategory {
  id: string;
  name: string;
  emoji?: string;
  filter: (item: any) => boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function Search<T>({
  data,
  onSearch,
  searchKeys,
  placeholder = "Search...",
  categories = [],
  onItemPress,
  renderItem,
  className,
  debounceMs = 300
}: SearchProps<T>) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const debouncedQuery = useDebounce(query, debounceMs);

  const filteredResults = useMemo(() => {
    let results = data;

    if (selectedCategory && categories.length > 0) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        results = results.filter(category.filter);
      }
    }

    if (debouncedQuery.trim()) {
      results = results.filter(item =>
        searchKeys.some(key => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(debouncedQuery.toLowerCase());
          }
          return false;
        })
      );
    }

    return results;
  }, [data, searchKeys, debouncedQuery, selectedCategory, categories]);

  useEffect(() => {
    onSearch(filteredResults);
  }, [filteredResults, onSearch]);

  const handleClear = () => {
    setQuery('');
    setSelectedCategory(null);
  };

  const DefaultItemRenderer = ({ item }: { item: T }) => (
    <Pressable
      onPress={() => onItemPress?.(item)}
      className="p-4 border-b border-gray-100"
    >
      <View>
        {searchKeys.map(key => {
          const value = item[key];
          if (typeof value === 'string') {
            return (
              <Text key={String(key)} className="text-gray-800 mb-1">
                {value}
              </Text>
            );
          }
          return null;
        })}
      </View>
    </Pressable>
  );

  return (
    <View className={className}>
      <View className="relative">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 200)}
          className="pr-20"
        />
        {(query || selectedCategory) && (
          <Button
            variant="ghost"
            onPress={handleClear}
            className="absolute right-0 top-0 h-full px-4"
          >
            <Text className="text-gray-400">✕</Text>
          </Button>
        )}
      </View>

      {categories.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          <View className="flex-row space-x-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onPress={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onPress={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.emoji && `${category.emoji} `}{category.name}
              </Button>
            ))}
          </View>
        </ScrollView>
      )}

      {isActive && (query || selectedCategory) && (
        <Card className="mt-4 max-h-80">
          <View className="p-4 border-b border-gray-200">
            <Text className="font-medium text-gray-600">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <FlatList
            data={filteredResults}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => 
              renderItem ? renderItem(item) : <DefaultItemRenderer item={item} />
            }
            showsVerticalScrollIndicator={false}
          />
        </Card>
      )}

      {(query || selectedCategory) && !isActive && (
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </Text>
          <View className="flex-row space-x-2">
            {query && (
              <Badge variant="outline">
                "{query}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

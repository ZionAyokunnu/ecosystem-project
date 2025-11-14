import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { Text } from './Text';
import { Card } from './Card';

const screenWidth = Dimensions.get('window').width - 32;

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'progress';
  data: any;
  title?: string;
  className?: string;
}

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#3b82f6',
  },
};

export function Chart({ type, data, title, className }: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        );
      
      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            showValuesOnTopOfBars
          />
        );
      
      case 'pie':
        return (
          <PieChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        );
      
      case 'progress':
        return (
          <ProgressChart
            data={data}
            width={screenWidth}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
          />
        );
      
      default:
        return <Text>Unsupported chart type</Text>;
    }
  };

  return (
    <Card className={className}>
      {title && (
        <View className="p-4 pb-0">
          <Text className="text-xl font-bold">{title}</Text>
        </View>
      )}
      <View className="items-center p-4">
        {renderChart()}
      </View>
    </Card>
  );
}

export const transformChartData = (rawData: any[], type: 'line' | 'bar' | 'pie' | 'progress') => {
  switch (type) {
    case 'line':
    case 'bar':
      return {
        labels: rawData.map(item => item.label),
        datasets: [{
          data: rawData.map(item => item.value),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        }]
      };
    
    case 'pie':
      return rawData.map((item, index) => ({
        name: item.label,
        value: item.value,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      }));
    
    case 'progress':
      return {
        labels: rawData.map(item => item.label),
        data: rawData.map(item => item.value / 100),
        colors: rawData.map((_, index) => `hsl(${(index * 137.5) % 360}, 70%, 50%)`),
      };
    
    default:
      return rawData;
  }
};

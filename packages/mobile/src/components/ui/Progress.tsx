import React from 'react';
import { View } from 'react-native';
import { cn } from '@/src/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <View className={cn("bg-secondary rounded-full overflow-hidden h-4", className)}>
      <View 
        className="bg-primary h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </View>
  );
}

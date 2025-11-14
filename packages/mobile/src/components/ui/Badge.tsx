import React from 'react';
import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';
import { Text } from './Text';

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary",
        secondary: "border-transparent bg-secondary",
        success: "border-transparent bg-green-500",
        destructive: "border-transparent bg-destructive",
        outline: "border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<typeof View>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const textColor = 
    variant === "default" ? "text-primary-foreground" :
    variant === "secondary" ? "text-secondary-foreground" :
    variant === "success" ? "text-white" :
    variant === "destructive" ? "text-destructive-foreground" :
    "text-foreground";

  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn("text-xs font-medium", textColor)}>{children}</Text>
    </View>
  );
}

export { Badge, badgeVariants };

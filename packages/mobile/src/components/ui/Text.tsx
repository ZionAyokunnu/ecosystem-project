import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface TextProps extends RNTextProps {
  className?: string;
}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-foreground", className)}
      {...props}
    />
  )
);

Text.displayName = "Text";

export { Text };

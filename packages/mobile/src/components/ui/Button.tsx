import React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary shadow",
        destructive: "bg-destructive shadow-sm",
        outline: "border border-input bg-background shadow-sm",
        secondary: "bg-secondary shadow-sm",
        ghost: "",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  "text-sm font-medium text-center",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        outline: "text-foreground",
        secondary: "text-secondary-foreground",
        ghost: "text-foreground",
        link: "text-primary underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <Pressable
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <Text className={cn(buttonTextVariants({ variant }))}>
          {children}
        </Text>
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface AnimatedPressableProps {
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  scaleValue?: number;
}

export function AnimatedPressable({ 
  onPress, 
  children, 
  className,
  scaleValue = 0.95 
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (onPress) {
      runOnJS(onPress)();
    }
  };

  const tap = Gesture.Tap()
    .onBegin(handlePressIn)
    .onFinalize(handlePressOut)
    .onEnd(handlePress);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={animatedStyle} className={className}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 600 }: FadeInProps) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
}

export function SlideUp({ children, delay = 0 }: SlideUpProps) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 20 });
      opacity.value = withTiming(1, { duration: 400 });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

export function Bounce({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

interface ShakeProps {
  children: React.ReactNode;
  trigger: boolean;
  onComplete?: () => void;
}

export function Shake({ children, trigger, onComplete }: ShakeProps) {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (trigger) {
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(
          withTiming(10, { duration: 100 }),
          5,
          true
        ),
        withTiming(0, { duration: 50 }, () => {
          if (onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [trigger, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

interface AnimatedProgressProps {
  progress: number;
  className?: string;
  duration?: number;
}

export function AnimatedProgress({ 
  progress, 
  className, 
  duration = 1000 
}: AnimatedProgressProps) {
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withTiming(progress, { duration });
  }, [progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View className={`bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <Animated.View 
        style={animatedStyle}
        className="bg-blue-500 h-full rounded-full"
      />
    </Animated.View>
  );
}

interface StaggeredListProps {
  children: React.ReactNode;
  stagger?: number;
}

export function StaggeredList({ children, stagger = 100 }: StaggeredListProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      {childrenArray.map((child, index) => (
        <SlideUp key={index} delay={index * stagger}>
          {child}
        </SlideUp>
      ))}
    </>
  );
}

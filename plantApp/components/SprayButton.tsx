import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';

interface SprayButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

interface BubbleProps {
  id: number;
  initialX: number;
  initialScale: number;
  onComplete: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function Bubble({ id, initialX, initialScale, onComplete }: BubbleProps) {
  const x = useSharedValue(initialX);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(initialScale);

  useEffect(() => {
    const driftAmount = (Math.random() - 0.5) * 40;
    const riseDistance = SCREEN_HEIGHT + 100;
    const duration = 2000 + Math.random() * 1000; // 2-3 seconds

    // Animate bubble rising
    y.value = withTiming(-riseDistance, {
      duration,
      easing: Easing.out(Easing.ease),
    });

    // Horizontal drift
    x.value = withTiming(initialX + driftAmount, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });

    // Fade out as it rises
    opacity.value = withTiming(0, {
      duration: duration * 0.7,
      easing: Easing.out(Easing.ease),
    });

    // Remove bubble after animation
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [initialX, onComplete, x, y, opacity]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: BrandColors.amethyst,
        },
        bubbleStyle,
      ]}
    />
  );
}

export function SprayButton({ onPress, isLoading = false }: SprayButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  
  // Bubbles state
  const [bubbles, setBubbles] = useState<Array<{ id: number; initialX: number; initialScale: number }>>([]);
  const bubbleIdCounter = useRef(0);

  const BUTTON_SIZE = 200;
  const BUTTON_RADIUS = BUTTON_SIZE / 2;

  const handlePress = () => {
    if (isLoading) return; // Prevent presses during loading
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Press animation
    scale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 1;
    rippleScale.value = withTiming(2, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    rippleOpacity.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    // Glow effect
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );

    // Create multiple bubbles with staggered timing
    const bubbleCount = 8 + Math.floor(Math.random() * 5); // 8-12 bubbles
    for (let i = 0; i < bubbleCount; i++) {
      setTimeout(() => {
        const id = bubbleIdCounter.current++;
        const initialX = (Math.random() - 0.5) * BUTTON_SIZE * 0.6;
        const initialScale = 0.3 + Math.random() * 0.4;
        setBubbles((prev) => [...prev, { id, initialX, initialScale }]);
      }, i * 50); // Stagger bubble creation
    }

    onPress();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: 0.4 + glowIntensity.value * 0.3,
      shadowRadius: 12 + glowIntensity.value * 8,
    };
  });

  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          initialX={bubble.initialX}
          initialScale={bubble.initialScale}
          onComplete={() => {
            setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
          }}
        />
      ))}

      {/* Ripple effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_RADIUS,
            backgroundColor: BrandColors.amethyst,
          },
          rippleAnimatedStyle,
        ]}
      />

      {/* Button */}
      <Animated.View style={buttonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: BrandColors.amethyst },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handlePress}
          disabled={isLoading}
          activeOpacity={1}>
          <Text style={styles.text}>Cast Watering Spell</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  ripple: {
    position: 'absolute',
    opacity: 0.3,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.amethyst,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

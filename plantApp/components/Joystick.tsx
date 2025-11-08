import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';

interface JoystickProps {
  onVectorChange: (x: number, y: number) => void;
  size?: number;
}

export function Joystick({ onVectorChange, size = 200 }: JoystickProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const thumbSize = size * 0.4;
  const maxDistance = (size - thumbSize) / 2;

  const pan = useRef(new Animated.ValueXY()).current;
  const [vector, setVector] = useState({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, gesture) => {
        const distance = Math.sqrt(gesture.dx ** 2 + gesture.dy ** 2);
        if (distance <= maxDistance) {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
          const normalizedX = gesture.dx / maxDistance;
          const normalizedY = -gesture.dy / maxDistance;
          setVector({ x: normalizedX, y: normalizedY });
          onVectorChange(normalizedX, normalizedY);
        } else {
          const angle = Math.atan2(gesture.dy, gesture.dx);
          const limitedX = maxDistance * Math.cos(angle);
          const limitedY = maxDistance * Math.sin(angle);
          pan.setValue({ x: limitedX, y: limitedY });
          const normalizedX = limitedX / maxDistance;
          const normalizedY = -limitedY / maxDistance;
          setVector({ x: normalizedX, y: normalizedY });
          onVectorChange(normalizedX, normalizedY);
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        setVector({ x: 0, y: 0 });
        onVectorChange(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderWidth: 2,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: BrandColors.amethyst,
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>

      <View style={styles.vectorDisplay}>
        <Text style={[styles.vectorText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          X: {vector.x.toFixed(2)} | Y: {vector.y.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumb: {
    shadowColor: BrandColors.amethyst,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  vectorDisplay: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(111, 91, 212, 0.1)',
    borderRadius: 8,
  },
  vectorText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

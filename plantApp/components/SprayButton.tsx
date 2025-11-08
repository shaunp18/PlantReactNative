import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';

interface SprayButtonProps {
  onPress: () => void;
}

export function SprayButton({ onPress }: SprayButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: BrandColors.amethyst }]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <Text style={styles.text}>Cast Watering Spell</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 24,
    shadowColor: BrandColors.amethyst,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? BrandColors.emerald : BrandColors.mint }]}>
      <Text style={[styles.label, { color: isDark ? BrandColors.mint : BrandColors.emerald }]}>
        Brew Score
      </Text>
      <Text style={[styles.score, { color: isDark ? '#FFF' : BrandColors.emerald }]}>
        {score.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  score: {
    fontSize: 16,
    fontWeight: '700',
  },
});

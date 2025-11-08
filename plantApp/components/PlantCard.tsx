import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import type { Plant } from '@/store/useAppStore';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export function PlantCard({ plant, onPress }: PlantCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getBrewColor = (brew: number) => {
    if (brew >= 80) return BrandColors.mint;
    if (brew >= 60) return '#FFC107';
    return '#FF5252';
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {plant.photoUri ? (
          <Image source={{ uri: plant.photoUri }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: BrandColors.emerald }]}>
            <Text style={styles.placeholderText}>{plant.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {plant.name}
          </Text>
          <View style={[styles.brewBadge, { backgroundColor: getBrewColor(plant.brew) }]}>
            <Text style={styles.brewText}>{plant.brew}%</Text>
          </View>
        </View>

        <Text style={[styles.species, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          {plant.species}
        </Text>

        <View style={styles.brewMeter}>
          <View style={[styles.brewFill, { width: `${plant.brew}%`, backgroundColor: getBrewColor(plant.brew) }]} />
        </View>

        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: isDark ? '#1E2528' : '#F0F0F0' }]}>
            <Text style={[styles.tagText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              Soil {plant.soilMoisture}%
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: isDark ? '#1E2528' : '#F0F0F0' }]}>
            <Text style={[styles.tagText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {plant.airQuality}
            </Text>
          </View>
        </View>

        <Text style={[styles.lastWatered, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          Last watered: {plant.lastWatered}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  brewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  brewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  species: {
    fontSize: 14,
  },
  brewMeter: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  brewFill: {
    height: '100%',
    borderRadius: 4,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastWatered: {
    fontSize: 12,
  },
});

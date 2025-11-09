import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { ScoreBadge } from '@/components/ScoreBadge';
import { SprayButton } from '@/components/SprayButton';
import { PlantCard } from '@/components/PlantCard';
import { SoilMoistureCard } from '@/components/SoilMoistureCard';
import type { Plant } from '@/store/useAppStore';

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user, score, moneySavedUsd, plants, activity, addActivity, incrementScore, addMoneySaved, logout } = useAppStore();
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const handleSpray = () => {
    const newActivity = {
      id: Date.now().toString(),
      text: 'Casting Watering Spell... (stub)',
      ts: Date.now(),
    };
    addActivity(newActivity);
    Alert.alert('Watering Spell Cast', 'Your plants are being watered! (UI stub)');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePlantPress = (plant: Plant) => {
    setSelectedPlant(plant);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.userChip}>
            <View style={[styles.userAvatar, { backgroundColor: BrandColors.amethyst }]}>
              <Text style={styles.userAvatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={[styles.userName, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {user?.name || 'User'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <ScoreBadge score={score} />
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
              onPress={handleLogout}
              activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color={isDark ? '#EF4444' : '#DC2626'} />
            </TouchableOpacity>
          </View>
        </View>

        <SprayButton onPress={handleSpray} />

        {/* Soil Moisture Sensor Card */}
        <SoilMoistureCard />

        <View style={[styles.moneyCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          <Text style={[styles.moneyLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Gold Saved
          </Text>
          <Text style={[styles.moneyAmount, { color: isDark ? BrandColors.mint : BrandColors.emerald }]}>
            ${moneySavedUsd.toFixed(2)}
          </Text>
          <Text style={[styles.moneySubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            from efficient watering
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Your Cauldrons
          </Text>
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onPress={() => handlePlantPress(plant)} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Recent Activity
          </Text>
          {activity.slice(0, 5).map((item) => (
            <View
              key={item.id}
              style={[styles.activityItem, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
              <Text style={[styles.activityText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {item.text}
              </Text>
              <Text style={[styles.activityTime, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                {new Date(item.ts).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedPlant !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPlant(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {selectedPlant?.name}
            </Text>
            <Text style={[styles.modalSpecies, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              {selectedPlant?.species}
            </Text>

            <View style={styles.sensorReadings}>
              <View style={styles.sensorItem}>
                <Text style={[styles.sensorLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Soil Moisture
                </Text>
                <Text style={[styles.sensorValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {selectedPlant?.soilMoisture}%
                </Text>
              </View>

              <View style={styles.sensorItem}>
                <Text style={[styles.sensorLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Air Quality
                </Text>
                <Text style={[styles.sensorValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {selectedPlant?.airQuality}
                </Text>
              </View>

              <View style={styles.sensorItem}>
                <Text style={[styles.sensorLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                  Brew Health
                </Text>
                <Text style={[styles.sensorValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  {selectedPlant?.brew}%
                </Text>
              </View>
            </View>

            <View style={[styles.suggestionBox, { backgroundColor: isDark ? '#1E2528' : '#F0F0F0' }]}>
              <Text style={[styles.suggestionText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                💡 Consider a light mist soon (mock suggestion)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: BrandColors.amethyst }]}
              onPress={() => setSelectedPlant(null)}
              activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  moneyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moneyLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  moneyAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  moneySubtitle: {
    fontSize: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  activityItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSpecies: {
    fontSize: 16,
    marginBottom: 24,
  },
  sensorReadings: {
    gap: 16,
    marginBottom: 24,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 16,
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  suggestionBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  suggestionText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

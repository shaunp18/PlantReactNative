import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

const SPECIES_LIST = [
  'Ficus elastica',
  'Sansevieria',
  'Monstera deliciosa',
  'Pothos',
  'Snake Plant',
  'Spider Plant',
  'Peace Lily',
  'Aloe Vera',
  'Crassula ovata',
  'Other',
];

export function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { setUser, addPlant, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);

  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [plantName, setPlantName] = useState('');
  const [plantSpecies, setPlantSpecies] = useState('');
  const [plantPhotoUri, setPlantPhotoUri] = useState<string | null>(null);
  const [plantLocation, setPlantLocation] = useState('');

  const pickImage = async (isAvatar: boolean) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (isAvatar) {
        setAvatarUri(result.assets[0].uri);
      } else {
        setPlantPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!displayName.trim()) {
        Alert.alert('Name Required', 'Please enter your display name.');
        return;
      }
      setUser({
        id: 'user-' + Date.now(),
        name: displayName.trim(),
        avatarUri,
      });
      setStep(2);
    } else if (step === 2) {
      if (!plantName.trim() || !plantSpecies) {
        Alert.alert('Plant Info Required', 'Please enter plant name and select a species.');
        return;
      }
      addPlant({
        id: 'plant-' + Date.now(),
        name: plantName.trim(),
        species: plantSpecies,
        brew: 75,
        soilMoisture: 40,
        airQuality: 'Good (AQI 30)',
        lastWatered: 'Today',
        photoUri: plantPhotoUri,
        location: plantLocation.trim() || undefined,
        isConnectedToSensor: true, // First plant is connected to ESP32 sensor
      });
      setStep(3);
    } else if (step === 3) {
      completeOnboarding();
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <View style={[styles.icon, { backgroundColor: BrandColors.emerald }]}>
        <Text style={styles.iconText}>🧪</Text>
      </View>
      <Text style={[styles.stepTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        Welcome to CauldronCare
      </Text>
      <Text style={[styles.stepDescription, { color: isDark ? '#9BA1A6' : '#687076' }]}>
        You're a Brew Warden in Poyo's greenhouse-factory. Keep your cauldrons (plants) healthy to
        raise your Brew Score.
      </Text>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        Create Your Profile
      </Text>

      <TouchableOpacity
        style={[styles.avatarPicker, { backgroundColor: BrandColors.amethyst }]}
        onPress={() => pickImage(true)}
        activeOpacity={0.8}>
        {avatarUri ? (
          <Text style={styles.avatarText}>✓</Text>
        ) : (
          <Text style={styles.avatarText}>+</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            color: isDark ? Colors.dark.text : Colors.light.text,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
        placeholder="Display Name"
        placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
        value={displayName}
        onChangeText={setDisplayName}
      />
    </View>
  );

  const renderAddPlant = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        Add Your First Cauldron
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            color: isDark ? Colors.dark.text : Colors.light.text,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
        placeholder="Plant Name"
        placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
        value={plantName}
        onChangeText={setPlantName}
      />

      <View style={styles.speciesList}>
        {SPECIES_LIST.map((species) => (
          <TouchableOpacity
            key={species}
            style={[
              styles.speciesChip,
              {
                backgroundColor:
                  plantSpecies === species ? BrandColors.emerald : isDark ? Colors.dark.card : Colors.light.card,
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
            onPress={() => setPlantSpecies(species)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.speciesText,
                {
                  color: plantSpecies === species ? '#FFF' : isDark ? Colors.dark.text : Colors.light.text,
                },
              ]}>
              {species}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            color: isDark ? Colors.dark.text : Colors.light.text,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
        placeholder="Location (optional)"
        placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
        value={plantLocation}
        onChangeText={setPlantLocation}
      />

      <TouchableOpacity
        style={[
          styles.photoButton,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.border : Colors.light.border,
          },
        ]}
        onPress={() => pickImage(false)}
        activeOpacity={0.8}>
        <Text style={[styles.photoButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          {plantPhotoUri ? '✓ Photo Added' : '+ Add Photo (optional)'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.tip, { color: isDark ? '#9BA1A6' : '#687076' }]}>
        Tip: Robot senses soil moisture & air quality to help you water wisely.
      </Text>
    </ScrollView>
  );

  const renderTutorial = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        Quick Tutorial
      </Text>

      <View style={styles.tutorialCards}>
        <View style={[styles.tutorialCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          <Text style={styles.tutorialEmoji}>✨</Text>
          <Text style={[styles.tutorialTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Brew Score
          </Text>
          <Text style={[styles.tutorialText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Measure of plant vitality. Higher is better!
          </Text>
        </View>

        <View style={[styles.tutorialCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          <Text style={styles.tutorialEmoji}>💦</Text>
          <Text style={[styles.tutorialTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Cast Spray
          </Text>
          <Text style={[styles.tutorialText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Water your plants via the UI (robot feature coming soon)
          </Text>
        </View>

        <View style={[styles.tutorialCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          <Text style={styles.tutorialEmoji}>🎮</Text>
          <Text style={[styles.tutorialTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            JoyCon
          </Text>
          <Text style={[styles.tutorialText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Steer your robot with the virtual joystick
          </Text>
        </View>

        <View style={[styles.tutorialCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          <Text style={styles.tutorialEmoji}>💰</Text>
          <Text style={[styles.tutorialTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Money Saved
          </Text>
          <Text style={[styles.tutorialText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Efficient watering saves you money
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={styles.progressBar}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i <= step ? BrandColors.mint : isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
          />
        ))}
      </View>

      {step === 0 && renderWelcome()}
      {step === 1 && renderProfile()}
      {step === 2 && renderAddPlant()}
      {step === 3 && renderTutorial()}

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: BrandColors.amethyst }]}
        onPress={handleNext}
        activeOpacity={0.8}>
        <Text style={styles.nextButtonText}>{step === 3 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 24,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFF',
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  speciesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  speciesChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  speciesText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tip: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tutorialCards: {
    gap: 16,
    marginTop: 24,
  },
  tutorialCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  tutorialEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  tutorialText: {
    fontSize: 14,
    textAlign: 'center',
  },
  nextButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

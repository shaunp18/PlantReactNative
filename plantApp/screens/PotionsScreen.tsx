import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { PlantCard } from '@/components/PlantCard';
import { getPlantCareData } from '@/utils/plantData';
import type { Plant } from '@/store/useAppStore';

// Expanded plant species list for search
const PLANT_SPECIES_LIST = [
  'Ficus elastica',
  'Sansevieria',
  'Monstera deliciosa',
  'Pothos',
  'Snake Plant',
  'Spider Plant',
  'Peace Lily',
  'Aloe Vera',
  'Crassula ovata',
  'Philodendron',
  'ZZ Plant',
  'Rubber Plant',
  'Fiddle Leaf Fig',
  'Pothos Golden',
  'English Ivy',
  'Boston Fern',
  'Bamboo Palm',
  'Dracaena',
  'Jade Plant',
  'Succulent',
  'Cactus',
  'Lavender',
  'Basil',
  'Mint',
  'Rosemary',
  'Other',
];

export function PotionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { plants, addPlant } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'camera' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [plantName, setPlantName] = useState('');
  const [plantLocation, setPlantLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredSpecies = PLANT_SPECIES_LIST.filter((species) =>
    species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualAdd = () => {
    if (!plantName.trim() || !selectedSpecies) {
      Alert.alert('Missing Info', 'Please enter a plant name and select a species.');
      return;
    }

    // Get care data for the selected species
    const careData = getPlantCareData(selectedSpecies);

    // Create plant with species-specific care data
    const newPlant: Plant = {
      id: 'plant-' + Date.now(),
      name: plantName.trim(),
      species: selectedSpecies,
      brew: 75,
      soilMoisture: careData.idealSoilMoisture,
      airQuality: 'Good (AQI 30)',
      lastWatered: 'Today',
      photoUri: null,
      location: plantLocation.trim() || undefined,
      spraysPerDay: careData.spraysPerDay,
      dailyWaterML: careData.dailyWaterML,
      idealSoilMoisture: careData.idealSoilMoisture,
    };

    addPlant(newPlant);
    setShowAddModal(false);
    setAddMode(null);
    setPlantName('');
    setPlantLocation('');
    setSelectedSpecies(null);
    setSearchQuery('');
  };

  const handleCameraAdd = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to identify plants.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setIsProcessing(true);
      const photoUri = result.assets[0].uri;

      // Call Gemini API to identify plant and get information
      const plantData = await identifyPlantWithGemini(photoUri);

      if (plantData) {
        const newPlant: Plant = {
          id: 'plant-' + Date.now(),
          name: plantData.name || 'Unknown Plant',
          species: plantData.species || 'Unknown',
          brew: 75,
          soilMoisture: plantData.idealSoilMoisture || 50,
          airQuality: 'Good (AQI 30)',
          lastWatered: 'Today',
          photoUri: photoUri,
          location: plantLocation.trim() || undefined,
          spraysPerDay: plantData.spraysPerDay || 12,
          dailyWaterML: plantData.dailyWaterML || 177,
          idealSoilMoisture: plantData.idealSoilMoisture || 50,
        };

        addPlant(newPlant);
        setShowAddModal(false);
        setAddMode(null);
        setPlantLocation('');
        Alert.alert('Plant Added!', `${plantData.name} has been added to your cauldrons.`);
      } else {
        Alert.alert('Error', 'Could not identify the plant. Please try again or add manually.');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setShowAddModal(false);
        setAddMode(null);
      }}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
          {!addMode ? (
            // Choose mode
            <>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Add New Cauldron
              </Text>
              <Text style={[styles.modalSubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                How would you like to add your plant?
              </Text>

              <TouchableOpacity
                style={[styles.modeButton, { backgroundColor: BrandColors.amethyst }]}
                onPress={() => setAddMode('manual')}
                activeOpacity={0.8}>
                <Ionicons name="create-outline" size={24} color="#FFF" />
                <Text style={styles.modeButtonText}>Manual Entry</Text>
                <Text style={styles.modeButtonSubtext}>Search and select from list</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, { backgroundColor: BrandColors.emerald }]}
                onPress={() => setAddMode('camera')}
                activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={24} color="#FFF" />
                <Text style={styles.modeButtonText}>Camera</Text>
                <Text style={styles.modeButtonSubtext}>AI identifies your plant</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
                onPress={() => {
                  setShowAddModal(false);
                  setAddMode(null);
                }}
                activeOpacity={0.7}>
                <Text style={[styles.cancelButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : addMode === 'manual' ? (
            // Manual entry
            <ScrollView style={styles.manualForm}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Manual Entry
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

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                    color: isDark ? Colors.dark.text : Colors.light.text,
                    borderColor: isDark ? Colors.dark.border : Colors.light.border,
                  },
                ]}
                placeholder="Search for species..."
                placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView style={styles.speciesList} nestedScrollEnabled>
                {filteredSpecies.map((species) => (
                  <TouchableOpacity
                    key={species}
                    style={[
                      styles.speciesItem,
                      {
                        backgroundColor:
                          selectedSpecies === species
                            ? BrandColors.amethyst
                            : isDark
                              ? Colors.dark.card
                              : Colors.light.card,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSpecies(species);
                      setSearchQuery(species);
                    }}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.speciesText,
                        {
                          color:
                            selectedSpecies === species
                              ? '#FFF'
                              : isDark
                                ? Colors.dark.text
                                : Colors.light.text,
                        },
                      ]}>
                      {species}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

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
                style={[styles.addButton, { backgroundColor: BrandColors.amethyst }]}
                onPress={handleManualAdd}
                activeOpacity={0.8}>
                <Text style={styles.addButtonText}>Add Plant</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
                onPress={() => setAddMode(null)}
                activeOpacity={0.7}>
                <Text style={[styles.backButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Back
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // Camera mode
            <View style={styles.cameraMode}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Camera Identification
              </Text>
              <Text style={[styles.modalSubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                Take a photo of your plant to identify it automatically
              </Text>

              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={BrandColors.emerald} />
                  <Text style={[styles.processingText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                    Identifying plant...
                  </Text>
                </View>
              ) : (
                <>
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
                    style={[styles.cameraButton, { backgroundColor: BrandColors.emerald }]}
                    onPress={handleCameraAdd}
                    activeOpacity={0.8}>
                    <Ionicons name="camera" size={32} color="#FFF" />
                    <Text style={styles.cameraButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
                onPress={() => {
                  setAddMode(null);
                  setIsProcessing(false);
                }}
                activeOpacity={0.7}
                disabled={isProcessing}>
                <Text style={[styles.backButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Your Cauldrons</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {plants.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color={isDark ? '#9BA1A6' : '#687076'} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              No cauldrons yet
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              Tap the button below to add your first plant
            </Text>
          </View>
        ) : (
          plants.map((plant) => <PlantCard key={plant.id} plant={plant} onPress={() => {}} />)
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButtonFAB, { backgroundColor: BrandColors.amethyst }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {renderAddModal()}
    </SafeAreaView>
  );
}

// Google Gemini API integration
async function identifyPlantWithGemini(imageUri: string): Promise<{
  name: string;
  species: string;
  dailyWaterML: number;
  idealSoilMoisture: number;
  spraysPerDay: number;
  careInfo?: string;
} | null> {
  try {
    // Convert image to base64 for React Native
    // Use expo-file-system for native, FileReader for web
    let base64Image: string;
    
    if (imageUri.startsWith('data:')) {
      const commaIndex = imageUri.indexOf(',');
      base64Image = commaIndex !== -1 ? imageUri.slice(commaIndex + 1) : imageUri;
    } else if (
      (typeof FileReader !== 'undefined' && (imageUri.startsWith('http') || imageUri.startsWith('blob:'))) ||
      Platform.OS === 'web'
    ) {
      // Web environment or remote URL
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Native environment - use expo-file-system
      const nativeUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
      const encoding: any = (FileSystem as any)?.EncodingType?.Base64 ?? 'base64';
      base64Image = await FileSystem.readAsStringAsync(nativeUri, {
        encoding,
      });
    }

    // Get Gemini API key from environment or use a placeholder
    // In production, store this securely
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCURZS8m6S6f2lVZdgfPWIaOLxoZt1Ur5Y';
    console.log('API key present?', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY, 'length:', process.env.EXPO_PUBLIC_GEMINI_API_KEY?.length);


    if (apiKey === 'YOUR_GEMINI_API_KEY') {
      // Fallback for demo - return mock data
      console.warn('Gemini API key not configured, using mock data');
      return {
        name: 'Unknown Plant',
        species: 'Unknown Species',
        dailyWaterML: 177,
        idealSoilMoisture: 50,
        spraysPerDay: 12,
        careInfo: 'Please configure Gemini API key for plant identification',
      };
    }

    // Determine mime type from URI
    let mimeType = 'image/jpeg';
    const lower = (imageUri || '').toLowerCase();
    if (lower.endsWith('.png')) mimeType = 'image/png';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lower.endsWith('.heic') || lower.endsWith('.heif')) mimeType = 'image/heic';

    console.log('Gemini request — mimeType:', mimeType, 'base64 length:', base64Image?.length);
    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Identify this plant from the image and provide detailed information. Research the plant's care requirements and return the following in JSON format (ONLY JSON, no markdown or extra text):

{
  "name": "Common name of the plant (e.g., 'Snake Plant', 'Monstera')",
  "species": "Scientific name in format 'Genus species' (e.g., 'Sansevieria trifasciata')",
  "dailyWaterML": number in milliliters (average daily water requirement - research typical watering needs),
  "idealSoilMoisture": number 0-100 (ideal soil moisture percentage for this plant species),
  "spraysPerDay": number (calculate this as: dailyWaterML divided by 4ml per spray, rounded to nearest integer),
  "careInfo": "Brief care instructions including light, water, and soil preferences"
}

Important:
- Research the actual water needs for this specific plant species
- Calculate spraysPerDay = Math.round(dailyWaterML / 4)
- Be accurate with scientific names
- If you cannot identify the plant, use "Unknown Plant" and "Unknown Species" with default values

Return ONLY valid JSON, no other text.`,
                },
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      let bodyText = '';
      try {
        bodyText = await geminiResponse.text();
      } catch {}
      console.log('Gemini failed:', geminiResponse.status, geminiResponse.statusText, bodyText?.slice(0, 300));
      throw new Error(`Gemini API error: status ${geminiResponse.status} ${geminiResponse.statusText} body: ${bodyText?.slice(0, 300)}`);
    }

    const data = await geminiResponse.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const plantData = JSON.parse(jsonMatch[0]);

    // Calculate sprays per day if not provided
    if (!plantData.spraysPerDay && plantData.dailyWaterML) {
      const mlPerSpray = 4; // Average spray bottle squirt
      plantData.spraysPerDay = Math.round(plantData.dailyWaterML / mlPerSpray);
    }

    return {
      name: plantData.name || 'Unknown Plant',
      species: plantData.species || 'Unknown Species',
      dailyWaterML: plantData.dailyWaterML || 177,
      idealSoilMoisture: plantData.idealSoilMoisture || 50,
      spraysPerDay: plantData.spraysPerDay || 12,
      careInfo: plantData.careInfo,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addButtonFAB: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modeButton: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  modeButtonSubtext: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  manualForm: {
    maxHeight: 500,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  speciesList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  speciesItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  speciesText: {
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraMode: {
    alignItems: 'center',
  },
  cameraButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  cameraButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

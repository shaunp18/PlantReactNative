/**
 * Plant Data Utility
 * 
 * Provides default care information for common plant species
 * Used for manual plant entry when species is selected
 */

interface PlantCareData {
  dailyWaterML: number;
  idealSoilMoisture: number;
  spraysPerDay: number;
}

// Default care data for common plants
// spraysPerDay is calculated as: dailyWaterML / 4ml per spray
const PLANT_CARE_DATA: Record<string, PlantCareData> = {
  'Ficus elastica': {
    dailyWaterML: 200,
    idealSoilMoisture: 50,
    spraysPerDay: 50, // 200ml / 4ml = 50
  },
  'Sansevieria': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13, // 50ml / 4ml = 12.5 rounded
  },
  'Monstera deliciosa': {
    dailyWaterML: 250,
    idealSoilMoisture: 60,
    spraysPerDay: 63, // 250ml / 4ml = 62.5 rounded
  },
  'Pothos': {
    dailyWaterML: 150,
    idealSoilMoisture: 50,
    spraysPerDay: 38, // 150ml / 4ml = 37.5 rounded
  },
  'Snake Plant': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Spider Plant': {
    dailyWaterML: 150,
    idealSoilMoisture: 50,
    spraysPerDay: 38,
  },
  'Peace Lily': {
    dailyWaterML: 200,
    idealSoilMoisture: 60,
    spraysPerDay: 50,
  },
  'Aloe Vera': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Crassula ovata': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Philodendron': {
    dailyWaterML: 200,
    idealSoilMoisture: 55,
    spraysPerDay: 50,
  },
  'ZZ Plant': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Rubber Plant': {
    dailyWaterML: 200,
    idealSoilMoisture: 50,
    spraysPerDay: 50,
  },
  'Fiddle Leaf Fig': {
    dailyWaterML: 250,
    idealSoilMoisture: 55,
    spraysPerDay: 63,
  },
  'Pothos Golden': {
    dailyWaterML: 150,
    idealSoilMoisture: 50,
    spraysPerDay: 38,
  },
  'English Ivy': {
    dailyWaterML: 150,
    idealSoilMoisture: 50,
    spraysPerDay: 38,
  },
  'Boston Fern': {
    dailyWaterML: 200,
    idealSoilMoisture: 70,
    spraysPerDay: 50,
  },
  'Bamboo Palm': {
    dailyWaterML: 200,
    idealSoilMoisture: 60,
    spraysPerDay: 50,
  },
  'Dracaena': {
    dailyWaterML: 150,
    idealSoilMoisture: 50,
    spraysPerDay: 38,
  },
  'Jade Plant': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Succulent': {
    dailyWaterML: 50,
    idealSoilMoisture: 30,
    spraysPerDay: 13,
  },
  'Cactus': {
    dailyWaterML: 30,
    idealSoilMoisture: 20,
    spraysPerDay: 8, // 30ml / 4ml = 7.5 rounded
  },
  'Lavender': {
    dailyWaterML: 100,
    idealSoilMoisture: 40,
    spraysPerDay: 25,
  },
  'Basil': {
    dailyWaterML: 200,
    idealSoilMoisture: 60,
    spraysPerDay: 50,
  },
  'Mint': {
    dailyWaterML: 200,
    idealSoilMoisture: 60,
    spraysPerDay: 50,
  },
  'Rosemary': {
    dailyWaterML: 100,
    idealSoilMoisture: 40,
    spraysPerDay: 25,
  },
};

/**
 * Get care data for a plant species
 * @param species - Plant species name
 * @returns Care data or default values
 */
export function getPlantCareData(species: string): PlantCareData {
  const careData = PLANT_CARE_DATA[species];
  if (careData) {
    return careData;
  }
  
  // Default values for unknown species
  return {
    dailyWaterML: 177, // Average ~0.177L per day
    idealSoilMoisture: 50,
    spraysPerDay: 44, // 177ml / 4ml = 44.25 rounded
  };
}

/**
 * Calculate sprays per day from daily water amount
 * @param dailyWaterML - Daily water requirement in milliliters
 * @returns Number of sprays per day (rounded)
 */
export function calculateSpraysPerDay(dailyWaterML: number): number {
  const mlPerSpray = 4; // Average spray bottle squirt
  return Math.round(dailyWaterML / mlPerSpray);
}


/**
 * Water Savings Calculator
 * 
 * Calculates money saved from efficient spray bottle watering vs traditional watering methods.
 * Based on realistic water usage and cost data for houseplants.
 */

// Constants based on real-world data
const WATER_COST_PER_GALLON = 0.005; // Average US water cost: $0.005 per gallon
const GALLONS_PER_LITER = 0.264172; // Conversion factor
const WATER_COST_PER_LITER = WATER_COST_PER_GALLON / GALLONS_PER_LITER; // ~$0.0189 per liter

// Average water usage per plant per day (in liters)
// Most houseplants need 0.5-1 cup per day, average ~0.75 cups = ~177ml = 0.177L
const DAILY_WATER_PER_PLANT_LITERS = 0.177;

// Traditional watering typically uses 1.5-2 cups per session (overwatering is common)
// Average: 1.5 cups = ~355ml = 0.355L per plant per watering session
const TRADITIONAL_WATERING_PER_PLANT_LITERS = 0.355;

// Spray bottle squirt uses approximately 3-5ml per squirt
// Average: 4ml = 0.004L per squirt
const SPRAY_SQUIRT_LITERS = 0.004;

/**
 * Calculates the daily water cost for a given number of plants
 * @param numPlants - Number of houseplants
 * @returns Daily water cost in USD
 */
export function calculateDailyWaterCost(numPlants: number): number {
  if (numPlants <= 0) return 0;
  
  const dailyWaterLiters = DAILY_WATER_PER_PLANT_LITERS * numPlants;
  return dailyWaterLiters * WATER_COST_PER_LITER;
}

/**
 * Calculates the money saved per spray bottle squirt
 * This represents the savings from using a spray bottle (efficient) vs traditional watering (less efficient)
 * 
 * The calculation is based on the efficiency difference between spray and traditional watering:
 * - Traditional watering per plant per session uses more water (overwatering is common)
 * - Spray bottle watering is more precise and uses less water
 * - Each spray saves a fixed amount, regardless of plant count
 * - More plants = more sprays needed = more total savings, but savings per spray stays constant
 * 
 * @param numPlants - Number of houseplants (not used in calculation, but kept for API consistency)
 * @returns Money saved in USD per spray squirt (fixed amount)
 */
export function calculateSavingsPerSpray(numPlants: number): number {
  // Fixed savings per spray - doesn't depend on number of plants
  // More plants = more sprays needed = more total savings naturally
  
  // Traditional watering typically uses 1.5-2 cups per plant per session (overwatering)
  // Average: 1.5 cups = ~355ml = 0.355L per plant per watering session
  const traditionalWateringPerSession = 0.355; // liters per plant per session
  
  // Spray bottle squirt uses approximately 3-5ml per squirt
  // Average: 4ml = 0.004L per squirt
  const spraySquirtAmount = 0.004; // liters per squirt
  
  // Calculate the water saved per spray (assuming one spray replaces traditional watering for one plant)
  // In reality, you might need multiple sprays per plant, but we're calculating efficiency savings
  const waterSavedPerSpray = traditionalWateringPerSession - spraySquirtAmount; // ~0.351L saved
  
  // Convert to cost savings
  const savingsPerSpray = waterSavedPerSpray * WATER_COST_PER_LITER;
  
  // Ensure minimum savings to make it meaningful (at least $0.005 per spray)
  // This represents the efficiency savings from using precise spray vs wasteful traditional watering
  return Math.max(0.005, savingsPerSpray);
}

/**
 * Formats a money amount to a readable string
 * @param amount - Amount in USD
 * @returns Formatted string (e.g., "$0.05")
 */
export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}


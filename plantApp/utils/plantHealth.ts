/**
 * Plant Health Calculator
 * 
 * Calculates plant health impact based on soil moisture dryness duration.
 * The longer a plant is dry, the more it affects health.
 */

/**
 * Calculates health impact based on how long the soil has been dry
 * Uses the original health when dryness started to calculate cumulative impact
 * 
 * @param drynessDurationHours - How long the soil has been dry in hours
 * @param originalHealth - Plant health when dryness started (0-100)
 * @returns New health value (0-100) after applying dryness impact
 */
export function calculateHealthFromDryness(
  drynessDurationHours: number,
  originalHealth: number
): number {
  // Immediate dryness (0-1 hour): ~5% health drop
  // Few hours (1-12 hours): ~20% health drop
  // Multiple days (12+ hours): Significant health drop, scales with time
  
  let healthDrop = 0;
  
  if (drynessDurationHours <= 1) {
    // Immediate dryness: 5% drop
    healthDrop = 5;
  } else if (drynessDurationHours <= 12) {
    // Few hours: Linear interpolation from 5% to 20%
    // At 1 hour: 5%, at 12 hours: 20%
    const progress = (drynessDurationHours - 1) / 11; // 0 to 1
    healthDrop = 5 + progress * 15; // 5% to 20%
  } else {
    // Multiple days: More severe impact
    // At 12 hours: 20%, at 24 hours: 35%, at 48 hours: 60%, at 72 hours: 80%
    const days = drynessDurationHours / 24;
    
    if (days <= 1) {
      // 12-24 hours: 20% to 35%
      const progress = (drynessDurationHours - 12) / 12;
      healthDrop = 20 + progress * 15;
    } else if (days <= 2) {
      // 1-2 days: 35% to 60%
      const progress = (days - 1) / 1;
      healthDrop = 35 + progress * 25;
    } else if (days <= 3) {
      // 2-3 days: 60% to 80%
      const progress = (days - 2) / 1;
      healthDrop = 60 + progress * 20;
    } else {
      // 3+ days: 80% to 95% (almost dead)
      const progress = Math.min((days - 3) / 2, 1); // Cap at 1
      healthDrop = 80 + progress * 15;
    }
  }
  
  // Apply health drop from original health, but don't go below 5% (plant is still alive)
  const newHealth = Math.max(5, originalHealth - healthDrop);
  
  return Math.round(newHealth * 10) / 10; // Round to 1 decimal place
}

/**
 * Determines if soil moisture reading indicates dry soil
 * Based on ESP32 sensor: 0-1000 = LOW (dry), >1000 = IDEAL
 * 
 * @param moistureValue - Raw moisture reading from ESP32
 * @returns true if soil is considered dry
 */
export function isSoilDry(moistureValue: number | null): boolean {
  if (moistureValue === null) return false;
  // ESP32: 0-1000 = LOW (dry), >1000 = IDEAL
  return moistureValue <= 1000;
}

/**
 * Calculates hours between two timestamps
 * 
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds (defaults to now)
 * @returns Duration in hours
 */
export function getHoursSince(startTime: number, endTime: number = Date.now()): number {
  return (endTime - startTime) / (1000 * 60 * 60);
}


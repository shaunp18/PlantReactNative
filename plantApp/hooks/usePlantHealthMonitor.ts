import { useEffect, useRef } from 'react';
import { useBLE } from './useBLE';
import { useAppStore } from '@/store/useAppStore';
import { isSoilDry, calculateHealthFromDryness, getHoursSince } from '@/utils/plantHealth';

/**
 * Hook to monitor ESP32 soil moisture and update plant health
 * Connects to the first plant created by the user
 */
export function usePlantHealthMonitor() {
  const { moistureValue, isConnected } = useBLE();
  const { plants, updatePlantHealth, updatePlantDryness } = useAppStore();
  
  // Find the first plant (the one created on login/onboarding)
  // In a real app, you might want to track which plant is connected to which sensor
  const firstPlant = plants.length > 0 ? plants[0] : null;
  const lastHealthUpdateRef = useRef<number>(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!firstPlant || !isConnected || moistureValue === null) {
      // Clear interval if no plant or sensor disconnected
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      return;
    }

    const isDry = isSoilDry(moistureValue);
    
    // Update dryness state
    updatePlantDryness(firstPlant.id, isDry);

    // If soil is dry, calculate health impact periodically
    if (isDry && firstPlant.drynessStartTime && firstPlant.healthAtDrynessStart !== undefined) {
      const drynessHours = getHoursSince(firstPlant.drynessStartTime);
      // Use original health when dryness started, not current health
      const newHealth = calculateHealthFromDryness(drynessHours, firstPlant.healthAtDrynessStart);
      
      // Only update if health changed significantly (avoid constant updates)
      // Update every 5 minutes or if health would drop by more than 1%
      const now = Date.now();
      const timeSinceLastUpdate = now - lastHealthUpdateRef.current;
      const healthDifference = Math.abs(firstPlant.brew - newHealth);
      
      if (timeSinceLastUpdate > 5 * 60 * 1000 || healthDifference > 1) {
        updatePlantHealth(firstPlant.id, newHealth);
        lastHealthUpdateRef.current = now;
      }

      // Set up periodic health updates while dry (every 5 minutes)
      if (!updateIntervalRef.current) {
        updateIntervalRef.current = setInterval(() => {
          const state = useAppStore.getState();
          const currentPlant = state.plants.find(p => p.id === firstPlant.id);
          if (currentPlant && currentPlant.drynessStartTime && currentPlant.healthAtDrynessStart !== undefined) {
            const hours = getHoursSince(currentPlant.drynessStartTime);
            const health = calculateHealthFromDryness(hours, currentPlant.healthAtDrynessStart);
            state.updatePlantHealth(currentPlant.id, health);
            lastHealthUpdateRef.current = Date.now();
          }
        }, 5 * 60 * 1000); // Every 5 minutes
      }
    } else {
      // Soil is not dry - clear interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [moistureValue, isConnected, firstPlant?.id, firstPlant?.drynessStartTime, firstPlant?.brew, updatePlantHealth, updatePlantDryness]);
}


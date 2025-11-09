// ESP32 Bluetooth Low Energy (BLE) Configuration
// These UUIDs must match your ESP32 BLE service and characteristic UUIDs
export const esp32BLEConfig = {
  // Device name to scan for (must match ESP32 device name)
  deviceName: 'PlantMonitor_BLE',
  // Service UUID (must match ESP32 SERVICE_UUID)
  serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  // Characteristic UUID (must match ESP32 CHARACTERISTIC_UUID)
  characteristicUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
  // Connection timeout in milliseconds
  connectionTimeout: 20000,
  // Scan timeout in milliseconds
  scanTimeout: 15000,
};

// Determine soil moisture status based on value
export const getSoilMoistureStatus = (moisture: number): 'LOW' | 'IDEAL' | 'UNKNOWN' => {
  if (moisture >= 0 && moisture <= 1000) {
    return 'LOW';
  } else if (moisture > 1000) {
    return 'IDEAL';
  }
  return 'UNKNOWN';
};


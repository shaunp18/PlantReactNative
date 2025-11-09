import { useState, useEffect, useCallback } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { decode as base64Decode } from 'base-64';
import { esp32BLEConfig } from '@/config/esp32';

// Helper to convert UUID to standard format (lowercase, with dashes)
const normalizeUUID = (uuid: string): string => {
  return uuid.toLowerCase().replace(/-/g, '');
};

// Lazily create a singleton BLE Manager with a tolerant initialization strategy.
// Try constructing first (Dev Client should have the native module bundled). If construction fails,
// then treat the module as unavailable (likely running in Expo Go).
let manager: BleManager | null = null;
const getManager = (): BleManager | null => {
  if (manager) return manager;
  try {
    manager = new BleManager();
    return manager;
  } catch (e) {
    // As a fallback signal unavailability; this typically means not running in a custom dev client.
    return null;
  }
};

export interface BLEDevice {
  id: string;
  name: string | null;
  device: Device;
}

export function useBLE() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moistureValue, setMoistureValue] = useState<number | null>(null);
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  const monitorRef = { current: null as null | { remove: () => void } };

  // Request Bluetooth permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Older Android versions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    // iOS permissions are handled automatically
    return true;
  }, []);

  // Scan for ESP32 device (first check already-connected, then scan)
  const scanForDevice = useCallback(async (): Promise<Device | null> => {
    try {
      setError(null);
      setIsScanning(true);

      // Ensure BLE native module is available
      const m = getManager();
      if (!m) {
        setIsScanning(false);
        const msg =
          'Bluetooth module unavailable. Build and run a custom dev client (not Expo Go) to use BLE.';
        setError(msg);
        throw new Error(msg);
      }

      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth permissions not granted');
      }

      // Quick path A: if we previously connected in this session, try that device ID
      if (lastDeviceId) {
        try {
          const known = await m.devices([lastDeviceId]);
          if (known && known.length > 0) {
            setIsScanning(false);
            return known[0];
          }
        } catch (_) {}
      }

      // Quick path B: if already connected to our service, reuse that device
      try {
        const normalizedServiceUUID = normalizeUUID(esp32BLEConfig.serviceUUID);
        const connected = await m.connectedDevices([esp32BLEConfig.serviceUUID]);
        const match = connected.find((d) => {
          const uuids = (d.serviceUUIDs || []).map(normalizeUUID);
          return uuids.includes(normalizedServiceUUID);
        });
        if (match) {
          setIsScanning(false);
          return match;
        }
      } catch (_) {
        // ignore and proceed to active scan
      }

      // Ensure Bluetooth is powered on; on Android initial state can be transient
      let state = await m.state();
      if (state !== 'PoweredOn') {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            subscription.remove();
            reject(new Error('Bluetooth is not enabled. Please enable Bluetooth in settings.'));
          }, 4000);
          const subscription = m.onStateChange((s) => {
            if (s === 'PoweredOn') {
              clearTimeout(timeout);
              subscription.remove();
              resolve();
            }
          }, true);
        });
      }

      // Start scanning
      return new Promise((resolve, reject) => {
        let foundDevice: Device | null = null;
        const timeout = setTimeout(() => {
          m.stopDeviceScan();
          setIsScanning(false);
          if (foundDevice) {
            resolve(foundDevice);
          } else {
            reject(new Error(`Device "${esp32BLEConfig.deviceName}" not found`));
          }
        }, esp32BLEConfig.scanTimeout);

        m.startDeviceScan(
          [esp32BLEConfig.serviceUUID],
          { allowDuplicates: false, scanMode: 2 }, // 2 = LowLatency on Android
          (scanError, scannedDevice) => {
            if (scanError) {
              clearTimeout(timeout);
              m.stopDeviceScan();
              setIsScanning(false);
              reject(scanError);
              return;
            }

            if (scannedDevice) {
              const byName =
                scannedDevice.name === esp32BLEConfig.deviceName ||
                scannedDevice.localName === esp32BLEConfig.deviceName;
              const normalizedServiceUUID = normalizeUUID(esp32BLEConfig.serviceUUID);
              const serviceMatch = ((scannedDevice.serviceUUIDs || []).map(normalizeUUID)).includes(
                normalizedServiceUUID
              );

              if (byName || serviceMatch) {
                clearTimeout(timeout);
                m.stopDeviceScan();
                setIsScanning(false);
                foundDevice = scannedDevice;
                resolve(scannedDevice);
              }
            }
          }
        );
      });
    } catch (err) {
      setIsScanning(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan for device';
      setError(errorMessage);
      return null;
    }
  }, [requestPermissions]);

  // Connect to device
  const connectToDevice = useCallback(async (deviceToConnect: Device): Promise<void> => {
    if (isConnecting || isConnected) return;
    setIsConnecting(true);
    let isMounted = true;
    try {
      setError(null);
      setDevice(deviceToConnect);
      
      // Directly connect without manual Promise.race timeout to avoid native cancel race conditions
      let connectedDevice: Device | null = null;
      try {
        connectedDevice = await deviceToConnect.connect({ autoConnect: false });
      } catch (primaryErr: any) {
        // Retry once after a short delay (handles transient native errors)
        await new Promise((r) => setTimeout(r, 800));
        try {
          connectedDevice = await deviceToConnect.connect({ autoConnect: false });
        } catch (retryErr: any) {
          const reason = retryErr?.reason ? ` (${retryErr.reason})` : '';
          const message = retryErr?.message || 'Failed to connect to device';
          throw new Error(`${message}${reason}`);
        }
      }
      
      if (!isMounted) return;
      
      setIsConnected(true);
      setDevice(connectedDevice);
      setLastDeviceId(connectedDevice.id);

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Find the service
      const services = await connectedDevice.services();
      const normalizedServiceUUID = normalizeUUID(esp32BLEConfig.serviceUUID);
      const service = services.find((s) => normalizeUUID(s.uuid) === normalizedServiceUUID);

      if (!service) {
        throw new Error(`Service ${esp32BLEConfig.serviceUUID} not found`);
      }

      // Find the characteristic
      const characteristics = await service.characteristics();
      const normalizedCharUUID = normalizeUUID(esp32BLEConfig.characteristicUUID);
      const characteristic = characteristics.find(
        (c) => normalizeUUID(c.uuid) === normalizedCharUUID
      );

      if (!characteristic) {
        throw new Error(`Characteristic ${esp32BLEConfig.characteristicUUID} not found`);
      }

      // Helper function to parse moisture value from BLE characteristic
      const parseMoistureValue = (value: string | null): number | null => {
        if (!value) return null;

        try {
          let moistureString: string;
          
          // Try to decode from base64 (react-native-ble-plx returns base64)
          try {
            moistureString = base64Decode(value);
          } catch (decodeError) {
            // If decoding fails, assume it's already a plain string
            moistureString = value;
          }
          
          // Remove any null bytes or whitespace and parse
          const cleaned = moistureString.replace(/\0/g, '').trim();
          const moisture = parseInt(cleaned, 10);
          
          if (!isNaN(moisture) && moisture >= 0) {
            return moisture;
          }
        } catch (parseError) {
          console.error('Error parsing moisture value:', parseError);
        }
        
        return null;
      };

      // Read initial value
      try {
        const initialChar = await characteristic.read();
        const initialMoisture = parseMoistureValue(initialChar.value);
        if (initialMoisture !== null && isMounted) {
          setMoistureValue(initialMoisture);
        }
      } catch (readError) {
        console.warn('Could not read initial value:', readError);
        // Continue with monitoring even if initial read fails
      }

      // Monitor characteristic for notifications
      // keep a handle to dispose later
      const subscription = characteristic.monitor((monitorError, char) => {
        if (monitorError) {
          if (isMounted) {
            setError(`Monitor error: ${monitorError.message}`);
          }
          return;
        }

        if (char && char.value && isMounted) {
          const moisture = parseMoistureValue(char.value);
          if (moisture !== null) {
            setMoistureValue(moisture);
            setError(null); // Clear any previous errors
          }
        }
      });
      monitorRef.current = subscription as any;
    } catch (err) {
      if (isMounted) {
        setIsConnected(false);
        // Try to surface better details for BleError
        const anyErr: any = err;
        const reason = anyErr?.reason ? ` (${anyErr.reason})` : '';
        const message = anyErr?.message || 'Failed to connect to device';
        setError(`${message}${reason}`);
      }
      // Do not rethrow to avoid app-level crash
      return;
    }
    finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    try {
      if (device) {
        // dispose monitor first
        try { monitorRef.current?.remove?.(); } catch {}
        monitorRef.current = null;
        // Avoid cancelling during in-flight connect; wait briefly and re-check
        if (isConnecting) {
          await new Promise((r) => setTimeout(r, 600));
        }
        try {
          const connected = await device.isConnected();
          if (connected && !isConnecting) {
            await device.cancelConnection();
          }
        } catch (e) {
          // Swallow errors from isConnected/cancelConnection to avoid native crashes
        }
        setIsConnected(false);
        setDevice(null);
        setMoistureValue(null);
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  }, [device, isConnecting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (device) {
        try { monitorRef.current?.remove?.(); } catch {}
        monitorRef.current = null;
        // Do not cancel during in-flight connects to avoid native races on hot reload
        if (!isConnecting) {
          device.cancelConnection().catch(() => {});
        }
      }
      // Don't destroy manager as it's a singleton used by the app
    };
  }, [device, isConnecting]);

  return {
    isScanning,
    isConnected,
    device,
    error,
    moistureValue,
    scanForDevice,
    connectToDevice,
    disconnect,
  };
}


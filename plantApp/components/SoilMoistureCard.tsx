import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { getSoilMoistureStatus, esp32BLEConfig } from '@/config/esp32';
import { useBLE } from '@/hooks/useBLE';

export function SoilMoistureCard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { isConnected, isScanning, moistureValue, error, scanForDevice, connectToDevice, disconnect } = useBLE();

  const handleConnect = async () => {
    try {
      const device = await scanForDevice();
      if (device) {
        await connectToDevice(device);
      }
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const moisture = moistureValue;
  const loading = isScanning || (isConnected && moisture === null);

  const status = moisture !== null ? getSoilMoistureStatus(moisture) : 'UNKNOWN';
  const statusPhrase =
    status === 'LOW' ? 'Moisture is Low' : status === 'IDEAL' ? 'Moisture is Ideal' : 'UNKNOWN';
  
  const getStatusColor = () => {
    switch (status) {
      case 'LOW':
        return '#EF4444'; // Red
      case 'IDEAL':
        return '#10B981'; // Green
      default:
        return isDark ? '#9BA1A6' : '#687076'; // Gray
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'LOW':
        return 'water-outline';
      case 'IDEAL':
        return 'water';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf-outline" size={24} color={BrandColors.emerald} />
        </View>
        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Soil Moisture
        </Text>
      </View>

      {loading && moisture === null ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={BrandColors.emerald} />
          <Text style={[styles.loadingText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            {isScanning ? 'Scanning for device...' : 'Connecting to sensor...'}
          </Text>
        </View>
      ) : !isConnected && moisture === null ? (
        <View style={styles.errorContainer}>
          <Ionicons name="bluetooth-outline" size={24} color={isDark ? '#9BA1A6' : '#687076'} />
          <Text style={[styles.errorText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            {error || 'Not connected to ESP32'}
          </Text>
          <Text style={[styles.errorHint, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Looking for: {esp32BLEConfig.deviceName}
          </Text>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: BrandColors.emerald }]}
            onPress={handleConnect}
            disabled={isScanning}
            activeOpacity={0.8}>
            <Ionicons name="bluetooth" size={18} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.connectButtonText}>
              {isScanning ? 'Scanning...' : 'Connect to ESP32'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : error && !isConnected ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={[styles.errorText, { color: '#EF4444' }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: BrandColors.emerald }]}
            onPress={handleConnect}
            disabled={isScanning}
            activeOpacity={0.8}>
            <Text style={styles.connectButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.valueContainer}>
            <Text style={[styles.moistureValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {moisture !== null ? moisture.toLocaleString() : '--'}
            </Text>
            <Text style={[styles.unit, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              Raw Reading
            </Text>
          </View>

          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons name={getStatusIcon()} size={18} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {statusPhrase}
            </Text>
          </View>

          {/* Connection Status */}
          <View style={styles.connectionStatus}>
            <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.connectionText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              {isConnected ? 'Connected via Bluetooth' : 'Disconnected'}
            </Text>
            {isConnected && (
              <TouchableOpacity onPress={disconnect} style={styles.disconnectButton}>
                <Text style={[styles.disconnectText, { color: '#EF4444' }]}>Disconnect</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  moistureValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  connectButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  disconnectButton: {
    marginLeft: 8,
  },
  disconnectText: {
    fontSize: 12,
    fontWeight: '600',
  },
});


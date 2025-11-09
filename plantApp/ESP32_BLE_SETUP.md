# ESP32 Bluetooth Low Energy (BLE) Setup

## Overview

The app now uses Bluetooth Low Energy (BLE) to connect to your ESP32 soil moisture sensor instead of WiFi/HTTP. This provides a direct connection without requiring WiFi or an IP address.

## Important: Development Build Required

⚠️ **BLE requires native modules and will NOT work with Expo Go**. You must create a **development build**:

```bash
cd plantApp
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android  # or run:ios
```

Or use EAS Build:
```bash
eas build --profile development --platform android
```

## ESP32 Configuration

### 1. Upload BLE Code to ESP32

1. Open your ESP32 code in Arduino IDE or PlatformIO
2. Install required libraries:
   - `BLEDevice.h` (included with ESP32 board support)
   - `BLEUtils.h` (included with ESP32 board support)
   - `BLEServer.h` (included with ESP32 board support)
3. Upload the BLE code to your ESP32
4. Open Serial Monitor (115200 baud) to verify it's running

### 2. Verify ESP32 is Advertising

After uploading, you should see in Serial Monitor:
```
📡 Bluetooth LE Started!
📱 Device Name: PlantMonitor_BLE
🔗 Waiting for connection...
👉 Connect from your React Native app
```

### 3. UUIDs

The ESP32 uses these UUIDs (already configured in the app):
- **Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **Characteristic UUID**: `beb5483e-36e1-4688-b7f5-ea07361b26a8`
- **Device Name**: `PlantMonitor_BLE`

These are already configured in `plantApp/config/esp32.ts` and match your ESP32 code.

## App Configuration

### 1. Permissions

Bluetooth permissions are already configured in `app.json`:
- **Android**: BLUETOOTH, BLUETOOTH_SCAN, BLUETOOTH_CONNECT, LOCATION
- **iOS**: NSBluetoothAlwaysUsageDescription

### 2. No IP Address Needed

Unlike WiFi, BLE doesn't require an IP address. The app will automatically scan for the device named "PlantMonitor_BLE".

## How It Works

### ESP32 BLE Server

The ESP32:
- Creates a BLE server with the service and characteristic
- Reads soil moisture sensor every 2 seconds
- Sends moisture value as a string via BLE notifications
- Automatically reconnects when the app reconnects

### App BLE Client

The React Native app:
- Scans for the "PlantMonitor_BLE" device
- Connects to the ESP32 via BLE
- Subscribes to characteristic notifications
- Receives moisture values every 2 seconds (sent by ESP32)
- Displays the value and status (LOW/OPTIMAL) in real-time

## Testing

### 1. Prepare ESP32

1. Power on ESP32
2. Upload the BLE code
3. Verify it's advertising (check Serial Monitor)
4. Make sure ESP32 is within Bluetooth range (typically 10-30 meters)

### 2. Test in App

1. **Build a development build** (required - won't work in Expo Go)
2. Enable Bluetooth on your phone
3. Open the app
4. Navigate to Home screen
5. The app will automatically scan for "PlantMonitor_BLE"
6. Click "Connect to ESP32" if not auto-connected
7. Once connected, you should see real-time moisture readings

## Troubleshooting

### "Bluetooth permissions not granted"

**Solution**:
- **Android**: Go to Settings → Apps → CauldronCare → Permissions → Enable Bluetooth and Location
- **iOS**: The app will request permission automatically

### "Bluetooth is not enabled"

**Solution**:
- Enable Bluetooth in your phone's settings
- Make sure Bluetooth is turned on before opening the app

### "Device not found"

**Possible causes**:
1. ESP32 is not powered on
2. ESP32 code is not uploaded
3. ESP32 is not advertising (check Serial Monitor)
4. Device name doesn't match (should be "PlantMonitor_BLE")
5. ESP32 is out of range
6. Bluetooth is disabled on phone

**Solutions**:
- Check ESP32 Serial Monitor for "Bluetooth LE Started!" message
- Verify device name in ESP32 code matches "PlantMonitor_BLE"
- Move phone closer to ESP32
- Restart ESP32
- Restart phone Bluetooth

### "Service/Characteristic not found"

**Possible causes**:
1. UUIDs don't match between ESP32 and app
2. ESP32 is not properly advertising the service

**Solutions**:
- Verify UUIDs in ESP32 code match those in `config/esp32.ts`
- Check ESP32 Serial Monitor for errors
- Restart ESP32

### "Connection timeout"

**Possible causes**:
1. ESP32 is not responding
2. Too far from ESP32
3. Bluetooth interference

**Solutions**:
- Move closer to ESP32
- Restart ESP32
- Check for Bluetooth interference (other devices)

### App crashes or BLE doesn't work in Expo Go

**Solution**: 
- BLE requires native modules and won't work in Expo Go
- You MUST create a development build (see "Important: Development Build Required" above)

## Connection Flow

1. **App starts** → Automatically scans for "PlantMonitor_BLE"
2. **Device found** → Connects to ESP32
3. **Connected** → Discovers services and characteristics
4. **Subscribed** → Starts monitoring for notifications
5. **Receiving data** → ESP32 sends moisture value every 2 seconds
6. **Display** → App shows moisture value and status

## Data Format

- **ESP32 sends**: String containing moisture number (e.g., "1234")
- **App receives**: Base64-encoded string (decoded automatically)
- **App displays**: Parsed number with status (LOW/OPTIMAL)

## Advantages of BLE over WiFi

✅ **No WiFi required** - Works anywhere
✅ **No IP address needed** - Direct device-to-device connection
✅ **Lower power consumption** - More energy efficient
✅ **Better range for IoT** - Designed for short-range sensor connections
✅ **Simpler setup** - No network configuration needed

## Limitations

⚠️ **Range**: BLE has limited range (typically 10-30 meters)
⚠️ **One connection**: ESP32 can typically handle one BLE connection at a time
⚠️ **Development build required**: Won't work in Expo Go

## Next Steps

- Add multiple sensor support
- Store historical data
- Set up alerts for low moisture
- Add reconnection logic for dropped connections
- Implement BLE write capability for controlling the ESP32

## Security Notes

- BLE connections are encrypted by default
- No authentication in current implementation (suitable for home use)
- For production, consider adding pairing/authentication
- BLE is more secure than open WiFi networks

## Additional Resources

- [react-native-ble-plx Documentation](https://github.com/dotintent/react-native-ble-plx)
- [ESP32 BLE Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp-ble-mesh.html)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)


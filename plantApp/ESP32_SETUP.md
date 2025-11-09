# ESP32 Soil Moisture Sensor Setup

## Overview

The app can now connect to your ESP32 web server to display real-time soil moisture readings.

## ESP32 Configuration

### 1. Update WiFi Credentials

In your ESP32 code, update the WiFi credentials:

```cpp
const char* ssid = "Your_WiFi_Name";
const char* password = "Your_WiFi_Password";
```

### 2. Upload Code to ESP32

1. Open your ESP32 code in Arduino IDE or PlatformIO
2. Install required libraries:
   - `WiFi.h` (included with ESP32 board support)
   - `WebServer.h` (included with ESP32 board support)
3. Upload the code to your ESP32
4. Open Serial Monitor (115200 baud) to see the IP address

### 3. Find ESP32 IP Address

After the ESP32 connects to WiFi, it will print the IP address in the Serial Monitor:

```
Connected! IP address: 
192.168.1.100
```

**Important**: Note down this IP address - you'll need it for the app configuration.

## App Configuration

### 1. Update ESP32 IP Address

Edit `plantApp/config/esp32.ts` and update the `baseUrl`:

```typescript
export const esp32Config = {
  baseUrl: process.env.EXPO_PUBLIC_ESP32_URL || 'http://192.168.1.100', // Change this to your ESP32 IP
  // ...
};
```

**Or** create a `.env` file in the `plantApp` directory:

```env
EXPO_PUBLIC_ESP32_URL=http://192.168.1.100
```

Replace `192.168.1.100` with your actual ESP32 IP address.

### 2. Restart Expo Server

After updating the configuration, restart your Expo development server:

```bash
cd plantApp
npm start
```

## How It Works

### ESP32 Web Server

The ESP32 runs a web server that:
- Reads soil moisture sensor every 2 seconds
- Provides a `/data` endpoint that returns JSON: `{"moisture": 1234}`
- Updates the reading automatically

### App Integration

The React Native app:
- Polls the `/data` endpoint every 2 seconds
- Displays the moisture reading in a card on the home screen
- Shows status:
  - **LOW** (0-1000): Red indicator
  - **OPTIMAL** (1000-3000): Green indicator
- Handles connection errors gracefully

## Testing

### 1. Test ESP32 Web Server

1. Make sure ESP32 is powered on and connected to WiFi
2. Open a web browser on a device connected to the same WiFi network
3. Navigate to: `http://YOUR_ESP32_IP/data`
4. You should see JSON: `{"moisture":1234}`

### 2. Test in App

1. Make sure your phone/emulator is on the same WiFi network as the ESP32
2. Open the app
3. Navigate to the Home screen
4. You should see the "Soil Moisture" card with real-time data

## Troubleshooting

### "Cannot connect to ESP32" Error

**Possible causes:**
1. **Wrong IP address**: Check the Serial Monitor for the correct IP
2. **Different WiFi networks**: Phone and ESP32 must be on the same network
3. **ESP32 not running**: Make sure ESP32 is powered on and code is uploaded
4. **Firewall blocking**: Check if your router/firewall is blocking the connection

**Solutions:**
- Verify IP address in Serial Monitor
- Check WiFi network on both devices
- Test in browser first: `http://YOUR_ESP32_IP/data`
- Restart ESP32 if needed

### "Connection timeout" Error

**Possible causes:**
1. ESP32 is offline or not responding
2. Network latency is too high
3. ESP32 web server is not running

**Solutions:**
- Check ESP32 Serial Monitor for errors
- Verify ESP32 is connected to WiFi
- Test the endpoint in a browser
- Increase timeout in code if needed (default: 5 seconds)

### Data Not Updating

**Possible causes:**
1. Polling interval is too long
2. ESP32 is not updating the sensor reading
3. Network issues

**Solutions:**
- Check ESP32 code - sensor should update every 2 seconds
- Verify `/data` endpoint returns fresh data
- Check network connection

## API Endpoints

The ESP32 web server provides these endpoints:

- `GET /` - HTML page with moisture display
- `GET /data` - JSON data: `{"moisture": 1234}`
- `GET /moisture` - Plain text moisture value

The app uses the `/data` endpoint for JSON data.

## Sensor Reading Interpretation

- **0-1000**: LOW soil moisture (dry soil)
- **1000-3000**: OPTIMAL soil moisture (good moisture level)
- **>3000**: May indicate sensor issues or very wet soil

## Network Requirements

- ESP32 and phone/emulator must be on the **same WiFi network**
- ESP32 must have a static IP or you'll need to update the IP in the app each time
- For production, consider using a domain name or dynamic DNS

## Next Steps

- Add multiple sensor support
- Store historical data
- Set up alerts for low moisture
- Integrate with watering system
- Add authentication to ESP32 web server

## Security Notes

⚠️ **Important**: The current setup has no authentication. Anyone on your WiFi network can access the ESP32 web server.

For production:
- Add authentication to ESP32 web server
- Use HTTPS (requires SSL certificate)
- Implement rate limiting
- Use a more secure communication protocol


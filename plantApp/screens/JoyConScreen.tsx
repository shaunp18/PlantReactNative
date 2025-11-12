import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { Joystick } from '@/components/Joystick';
import { VideoFeedStub } from '@/components/VideoFeedStub';
import { usePiBLE } from '@/hooks/usePiBLE';

export function JoyConScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { robot, updateRobotVector, toggleRobotConnection } = useAppStore();
  const [isRunning, setIsRunning] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [hornOn, setHornOn] = useState(false);
  const lastVecRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // WebSocket wiring
  const WS_URL = 'ws://10.176.228.217:8765';
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<any>(null);
  const lastSentRef = useRef(0);
  
  // Pi BLE hook (mirrors ESP32 useBLE style)
  const { isConnected: bleConnected, isScanning: bleScanning, isConnecting: bleConnecting, error: bleError, connect: connectPiBle, writeNormVector, writeCommand } = usePiBLE();

  const connectWS = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        try { ws.send(JSON.stringify({ type: 'hello', source: 'app' })); } catch {}
      };
      ws.onclose = () => {
        reconnectTimerRef.current = setTimeout(connectWS, 1000);
      };
      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
      ws.onmessage = () => {};
    } catch {
      reconnectTimerRef.current = setTimeout(connectWS, 1000);
    }
  }, [WS_URL]);

  useEffect(() => {
    connectWS();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, [connectWS]);
  
  useEffect(() => {
    try { console.log('PiBLE state:', { bleConnected, bleScanning, bleError }); } catch {}
  }, [bleConnected, bleScanning, bleError]);

  const sendVector = useCallback((nx: number, ny: number) => {
    const now = Date.now();
    if (now - lastSentRef.current < 20) return; // ~50Hz
    lastSentRef.current = now;

    const x = Math.max(-1, Math.min(1, nx));
    const y = Math.max(-1, Math.min(1, ny));
    const tryWS = () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { console.log('WS fallback send', x, y); ws.send(JSON.stringify({ norm: { x, y } })); } catch {}
      }
    };
    if (bleConnected) {
      try { console.log('PiBLE write attempt', x, y); } catch {}
      (async () => {
        try {
          const ok = await writeNormVector(x, y);
          if (!ok) tryWS();
        } catch {
          tryWS();
        }
      })();
      return;
    }
    tryWS();
  }, [bleConnected, writeNormVector]);

  // When BLE becomes connected, immediately send one vector (last known) to start stream on Pi
  useEffect(() => {
    if (bleConnected) {
      const lv = lastVecRef.current;
      sendVector(lv.x, lv.y);
    }
  }, [bleConnected, sendVector]);

  const handleVectorChange = (x: number, y: number) => {
    updateRobotVector(x, y);
    lastVecRef.current = { x, y };
    sendVector(x, y);
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleCenter = () => {
    updateRobotVector(0, 0);
    lastVecRef.current = { x: 0, y: 0 };
  };

  // Heartbeat: resend last vector every 500ms so Pi receives periodic updates
  useEffect(() => {
    const id = setInterval(() => {
      const lv = lastVecRef.current;
      const wsOpen = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
      if (bleConnected || wsOpen) {
        sendVector(lv.x, lv.y);
      }
    }, 500);
    return () => clearInterval(id);
  }, [bleConnected, sendVector]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
            Robot Control
          </Text>
          <TouchableOpacity
            style={[
              styles.connectionBadge,
              {
                backgroundColor: robot.connected
                  ? 'rgba(76, 175, 80, 0.2)'
                  : 'rgba(244, 67, 54, 0.2)',
              },
            ]}
            onPress={toggleRobotConnection}
            activeOpacity={0.7}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: robot.connected ? '#4CAF50' : '#F44336' },
              ]}
            />
            <Text
              style={[
                styles.connectionText,
                { color: robot.connected ? '#4CAF50' : '#F44336' },
              ]}>
              {robot.connected ? 'Connected' : 'Disconnected'} (stub)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videoSection}>
          <VideoFeedStub />
        </View>

        <View style={styles.controlSection}>
          <View style={styles.bleRow}>
            <View style={[styles.bleDot, { backgroundColor: bleConnected ? '#10B981' : (bleScanning ? '#F59E0B' : '#EF4444') }]} />
            <Text style={[styles.bleText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {bleConnected ? 'PiJoyBLE: Connected' : bleScanning ? 'PiJoyBLE: Scanning…' : 'PiJoyBLE: Disconnected'}
            </Text>
            {!bleConnected && (
              <TouchableOpacity
                style={[styles.bleButton, { backgroundColor: BrandColors.amethyst }]}
                onPress={connectPiBle}
                disabled={bleScanning || bleConnecting}
                activeOpacity={0.8}
              >
                <Text style={styles.bleButtonText}>{bleScanning || bleConnecting ? 'Connecting…' : 'Connect BLE'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!!bleError && (
            <Text style={[styles.bleErrorText]}>{bleError}</Text>
          )}

          <View style={styles.joystickContainer}>
            <Joystick onVectorChange={handleVectorChange} size={180} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: isRunning ? '#4CAF50' : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={handleStartStop}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: isRunning ? '#FFF' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                {isRunning ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: isDark ? Colors.dark.card : Colors.light.card },
              ]}
              onPress={handleCenter}
              activeOpacity={0.7}>
              <Text style={[styles.controlButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                Center
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: BrandColors.amethyst, opacity: bleConnected && !bleConnecting ? 1 : 0.6 },
              ]}
              onPress={() => writeCommand('spray', { ms: 1000 })}
              disabled={!bleConnected || bleConnecting}
              activeOpacity={0.8}
            >
              <Text style={[styles.controlButtonText, { color: '#FFF' }]}>Spray Water</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: lightOn ? '#FFC107' : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={() => setLightOn(!lightOn)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: lightOn ? '#000' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                💡 Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: hornOn ? BrandColors.amethyst : isDark ? Colors.dark.card : Colors.light.card,
                },
              ]}
              onPress={() => setHornOn(!hornOn)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.controlButtonText,
                  { color: hornOn ? '#FFF' : isDark ? Colors.dark.text : Colors.light.text },
                ]}>
                📢 Horn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  videoSection: {
    marginBottom: 20,
  },
  controlSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  bleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  bleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  bleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bleButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bleErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
  },
  joystickContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// Pi peripheral configuration (must match Raspberry Pi bleno script)
const DEVICE_NAME = 'PiJoyBLE';
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

const normalizeUUID = (u: string) => u.replace(/-/g, '').toLowerCase();

export function usePiBLE() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const charRef = useRef<Characteristic | null>(null);
  const managerRef = useRef<BleManager | null>(null);
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);
  const disconnectSubRef = useRef<ReturnType<BleManager['onDeviceDisconnected']> | null>(null);

  const getManager = () => {
    if (!managerRef.current) managerRef.current = new BleManager();
    return managerRef.current;
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return (
        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }, []);

  const scanAndConnect = useCallback(async (): Promise<Device | null> => {
    setError(null);
    setIsScanning(true);
    const m = getManager();
    try { console.log('PiBLE: starting scan'); } catch {}

    // quick path by last id
    if (lastDeviceId) {
      try {
        const known = await m.devices([lastDeviceId]);
        if (known && known.length) {
          setIsScanning(false);
          return known[0];
        }
      } catch {}
    }

    const ok = await requestPermissions();
    if (!ok) {
      setIsScanning(false);
      setError('Bluetooth permissions not granted');
      return null;
    }

    // ensure powered on
    let state = await m.state();
    if (state !== 'PoweredOn') {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          sub.remove();
          reject(new Error('Bluetooth is not enabled'));
        }, 5000);
        const sub = m.onStateChange((s) => {
          if (s === 'PoweredOn') {
            clearTimeout(timeout);
            sub.remove();
            resolve();
          }
        }, true);
      }).catch(() => {});
    }

    return new Promise<Device | null>((resolve) => {
      let found: Device | null = null;
      const to = setTimeout(() => {
        try { m.stopDeviceScan(); } catch {}
        setIsScanning(false);
        try { console.log('PiBLE: scan timeout'); } catch {}
        resolve(found);
      }, 15000);

      m.startDeviceScan(null, { allowDuplicates: false, scanMode: 2 }, (e, d) => {
        if (e) {
          clearTimeout(to);
          try { m.stopDeviceScan(); } catch {}
          setIsScanning(false);
          setError(e.message);
          try { console.log('PiBLE: scan error', e.message); } catch {}
          resolve(null);
          return;
        }
        if (!d) return;
        const byName = d.name === DEVICE_NAME || d.localName === DEVICE_NAME;
        const svcUuids = (d.serviceUUIDs || []).map((u) => normalizeUUID(u));
        const bySvc = svcUuids.includes(normalizeUUID(SERVICE_UUID));
        if (byName || bySvc) {
          found = d;
          clearTimeout(to);
          try { m.stopDeviceScan(); } catch {}
          setIsScanning(false);
          try { console.log('PiBLE: found device', { name: d.name || d.localName, id: d.id, svcUuids: d.serviceUUIDs }); } catch {}
          resolve(d);
        }
      });
    });
  }, [requestPermissions, lastDeviceId]);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      try { console.log('PiBLE: connect ignored (busy/already connected)'); } catch {}
      return;
    }
    setIsConnecting(true);
    try {
      const m = getManager();
      const d = await scanAndConnect();
      if (!d) throw new Error(`${DEVICE_NAME} not found`);

      try { console.log('PiBLE: connecting to', d.id); } catch {}
      let c: Device;
      try {
        c = await d.connect({ autoConnect: false });
      } catch (ce) {
        try { console.log('PiBLE: first connect failed, retrying once', String(ce)); } catch {}
        await new Promise((r) => setTimeout(r, 800));
        c = await d.connect({ autoConnect: false });
      }
      try { console.log('PiBLE: connected, discovering services'); } catch {}
      await c.discoverAllServicesAndCharacteristics();
      const services = await c.services();
      const targetSvc = normalizeUUID(SERVICE_UUID);
      const svc = services.find((s) => normalizeUUID(s.uuid) === targetSvc);
      if (!svc) throw new Error('Service not found');
      const chars = await svc.characteristics();
      try { console.log('PiBLE: services', services.map(s => s.uuid)); console.log('PiBLE: chars', chars.map(k => k.uuid)); } catch {}
      const targetRx = normalizeUUID(RX_CHAR_UUID);
      let rx = chars.find((x) => normalizeUUID(x.uuid) === targetRx);
      if (!rx) {
        // Fallback: pick first writable characteristic
        rx = chars.find((x) => (x.isWritableWithResponse ?? false) || (x.isWritableWithoutResponse ?? false)) || null as any;
        if (!rx) throw new Error('RX characteristic not found');
        try { console.log('PiBLE: using fallback writable characteristic', rx.uuid, { wwr: rx.isWritableWithResponse, wwout: rx.isWritableWithoutResponse }); } catch {}
      } else {
        try { console.log('PiBLE: using target characteristic', rx.uuid, { wwr: rx.isWritableWithResponse, wwout: rx.isWritableWithoutResponse }); } catch {}
      }

      deviceRef.current = c;
      charRef.current = rx;
      setLastDeviceId(c.id);
      setIsConnected(true);
      setError(null);

      try {
        if (disconnectSubRef.current) { try { disconnectSubRef.current.remove(); } catch {} }
        disconnectSubRef.current = m.onDeviceDisconnected(c.id, (err, dev) => {
          try { console.log('PiBLE: onDeviceDisconnected', String(err || 'remote closed')); } catch {}
          setIsConnected(false);
          if (err) setError(String(err)); else setError('Disconnected');
        });
      } catch {}

      try {
        const payload = JSON.stringify({ hello: 'pi', ts: Date.now() });
        const b64 = Buffer.from(payload, 'utf-8').toString('base64');
        // Try with response first for debugging visibility
        try {
          await rx.writeWithResponse(b64);
          try { console.log('PiBLE: test writeWithResponse sent'); } catch {}
        } catch (werr) {
          try { console.log('PiBLE: test writeWithResponse failed, falling back', String(werr)); } catch {}
          await rx.writeWithoutResponse(b64);
          try { console.log('PiBLE: test writeWithoutResponse sent'); } catch {}
        }
      } catch (e:any) {
        try { console.log('PiBLE: test write error', String(e)); } catch {}
      }
    } catch (e: any) {
      setIsConnected(false);
      setError(e?.message || 'Failed to connect');
      try { console.log('PiBLE: connect error', String(e)); } catch {}
    }
    finally {
      setIsConnecting(false);
    }
  }, [scanAndConnect]);

  const disconnect = useCallback(async () => {
    try {
      const d = deviceRef.current;
      charRef.current = null;
      try { disconnectSubRef.current?.remove?.(); } catch {}
      disconnectSubRef.current = null;
      if (d) {
        const connected = await d.isConnected();
        if (connected) await d.cancelConnection();
      }
    } catch {}
    finally {
      setIsConnected(false);
    }
  }, []);

  const writeNormVector = useCallback(async (x: number, y: number): Promise<boolean> => {
    const ch = charRef.current;
    if (!ch || !isConnected) return false;
    try {
      const payload = JSON.stringify({ norm: { x, y } });
      const b64 = Buffer.from(payload, 'utf-8').toString('base64');
      await ch.writeWithResponse(b64);
      return true;
    } catch (e:any) {
      try { console.log('PiBLE: write error', String(e)); } catch {}
      return false;
    }
  }, [isConnected]);

  const writeCommand = useCallback(async (cmd: string, args: any = {}): Promise<boolean> => {
    const ch = charRef.current;
    if (!ch || !isConnected) return false;
    try {
      const payload = JSON.stringify({ cmd, args });
      const b64 = Buffer.from(payload, 'utf-8').toString('base64');
      await ch.writeWithResponse(b64);
      return true;
    } catch (e:any) {
      try { console.log('PiBLE: writeCommand error', String(e)); } catch {}
      return false;
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      // cleanup
      const d = deviceRef.current;
      charRef.current = null;
      try { disconnectSubRef.current?.remove?.(); } catch {}
      disconnectSubRef.current = null;
      if (d) {
        d.cancelConnection().catch(() => {});
      }
    };
  }, []);

  return {
    isScanning,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    writeNormVector,
    writeCommand,
  };
}

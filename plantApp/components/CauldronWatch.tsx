import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useBLE } from '@/hooks/useBLE';
import { computeScores, mapRawToPercent, PlantInput, Thresholds } from '@/utils/cauldronScore';
import { useAppStore } from '@/store/useAppStore';
import { detectEvents, reconcile, type Sample, type Ticket } from '@/utils/cauldronEvents';

const RAW_MIN = 0; // adjust if you know your sensor's calibrated min
const RAW_MAX = 2000; // adjust if you know your sensor's calibrated max

const DEFAULT_THRESHOLDS: Thresholds = { under: 35, over: 65 };

export function CauldronWatch() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAppStore();
  const { moistureValue } = useBLE();

  // Keep a rolling window of samples for live event detection
  const samplesRef = useRef<Sample[]>([]);
  const livePct = useMemo(() => mapRawToPercent(moistureValue, RAW_MIN, RAW_MAX), [moistureValue]);

  useEffect(() => {
    if (livePct === null) return;
    const now = Date.now();
    const arr = samplesRef.current;
    // Avoid pushing identical timestamp; also coalesce tiny jitter
    const prev = arr[arr.length - 1];
    if (!prev || Math.abs(prev.pct - livePct) >= 1 || now - prev.ts >= 5000) {
      arr.push({ ts: now, pct: livePct });
      if (arr.length > 240) arr.shift(); // keep last ~10-20 min depending on update rate
    }
  }, [livePct]);

  const data = useMemo(() => {
    const plants: PlantInput[] = [
      { id: 'live', name: 'Live Sensor', moisturePct: livePct },
      { id: 'under1', name: 'Droughtling', moisturePct: 20 }, // under-filled
      { id: 'ideal1', name: 'Balanced Basilisk', moisturePct: 55 }, // ideal
      { id: 'over1', name: 'Floodwyrm', moisturePct: 90 }, // over-filled
    ];

    const summary = computeScores(plants, DEFAULT_THRESHOLDS);

    // Event detection on live samples
    const samples = samplesRef.current;
    const events = detectEvents(samples, 12, 60_000);

    // Build a tiny set of mock tickets near recent events to exercise reconciliation
    const now = Date.now();
    const mockTickets: Ticket[] = [
      { id: 't1', ts: now - 2 * 60_000, amountPct: 15 },
      { id: 't2', ts: now - 8 * 60_000, amountPct: 10 },
    ];

    const recon = reconcile(events, mockTickets, 5 * 60_000, 8);

    return { summary, livePct, events, recon };
  }, [livePct, user?.name]);

  return (
    <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, shadowColor: isDark ? '#000' : '#00000010', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 }]} > 
      <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>CauldronWatch</Text>

      <View style={styles.row}>
        <Stat label="Under" value={String(data.summary.counts.under)} color="#EF4444" />
        <Stat label="Ideal" value={String(data.summary.counts.ideal)} color="#10B981" />
        <Stat label="Over" value={String(data.summary.counts.over)} color="#F59E0B" />
      </View>

      <View style={[styles.scoreBox, { backgroundColor: isDark ? '#101518' : '#F5F7F8', borderColor: isDark ? '#22313A' : '#E6ECEF', borderWidth: 1, borderRadius: 12 }]} > 
        <Text style={[styles.scoreLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>Your Score</Text>
        <Text style={[styles.scoreValue, { color: isDark ? BrandColors.mint : BrandColors.emerald }]}>{data.summary.total}</Text>
        <Text style={[styles.scoreHint, { color: isDark ? '#9BA1A6' : '#687076' }]}>Thresholds: {DEFAULT_THRESHOLDS.under}% - {DEFAULT_THRESHOLDS.over}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Live Cauldron</Text>
        <Text style={[styles.sectionText, { color: isDark ? '#9BA1A6' : '#687076' }]}> 
          {data.livePct === null ? 'Connect sensor to see live fill' : `${data.livePct}% filled`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Recent Collections</Text>
        {data.events.length === 0 ? (
          <Text style={[styles.sectionText, { color: isDark ? '#9BA1A6' : '#687076' }]}>No drops detected yet</Text>
        ) : (
          data.events.slice(-5).map((ev, idx) => (
            <View key={`ev-${idx}`} style={styles.rowLine}>
              <Text style={[styles.eventText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>-{ev.amountPct}%</Text>
              <Text style={[styles.eventTime, { color: isDark ? '#9BA1A6' : '#687076' }]}>{new Date(ev.ts).toLocaleTimeString()}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Reconciliation</Text>
        <Text style={[styles.sectionText, { color: isDark ? '#9BA1A6' : '#687076' }]}>Matched: {data.recon.matched.length}</Text>
        <Text style={[styles.sectionText, { color: '#EF4444' }]}>Missing Tickets: {data.recon.missingTickets.length}</Text>
        <Text style={[styles.sectionText, { color: '#F59E0B' }]}>Unlogged Collections: {data.recon.missingEvents.length}</Text>
      </View>

      {/* Leaderboard intentionally omitted here to avoid duplicating leaderboard UI */}
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: color + '22' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  stat: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  scoreBox: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreHint: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
  },
  eventText: {
    fontSize: 13,
    fontWeight: '700',
  },
  eventTime: {
    fontSize: 12,
  },
  
});

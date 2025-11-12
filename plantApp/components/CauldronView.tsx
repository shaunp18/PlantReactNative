import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, BrandColors } from '@/constants/theme';

export type CauldronState = 'UNDER' | 'IDEAL' | 'OVER' | 'UNKNOWN';

export function CauldronView({
  title,
  fillPct,
  state,
  dark = false,
  thresholds = { under: 35, over: 65 },
}: {
  title: string;
  fillPct: number | null; // 0-100 or null if unknown
  state: CauldronState;
  dark?: boolean;
  thresholds?: { under: number; over: number };
}) {
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;
  const surface = useRef(new Animated.Value(0)).current;
  const flames = useRef(new Animated.Value(0)).current;
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const overflow1 = useRef(new Animated.Value(0)).current;
  const overflow2 = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopBubble = (val: Animated.Value, delay: number, dur = 1700) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true, delay }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    loopBubble(bubble1, 0, 1600);
    loopBubble(bubble2, 500, 1900);
    loopBubble(bubble3, 950, 1500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(surface, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(surface, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flames, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(flames, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    const loopSteam = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 1800, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    loopSteam(steam1, 0);
    loopSteam(steam2, 900);

    const loopParticle = (val: Animated.Value, delay: number, dur = 2500) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: dur, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    loopParticle(particle1, 0, 3000);
    loopParticle(particle2, 1000, 3500);
    loopParticle(particle3, 2000, 2800);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    const loopOverflow = (val: Animated.Value, delay: number, dur = 1800) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: dur, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    loopOverflow(overflow1, 0, 1900);
    loopOverflow(overflow2, 700, 1700);
  }, [bubble1, bubble2, bubble3, surface, flames, steam1, steam2, particle1, particle2, particle3, glow, shimmer, overflow1, overflow2, tilt]);

  const color = state === 'OVER' ? '#3B82F6' : state === 'UNDER' ? '#EF4444' : state === 'IDEAL' ? '#10B981' : '#9CA3AF';
  const glowColor = state === 'OVER' ? '#60A5FA' : state === 'UNDER' ? '#FCA5A5' : state === 'IDEAL' ? '#34D399' : '#D1D5DB';
  const statusEmoji = state === 'OVER' ? '💧' : state === 'UNDER' ? '🔥' : state === 'IDEAL' ? '✨' : '❓';
  const statusText = state === 'OVER' ? 'Overflowing!' : state === 'UNDER' ? 'Too Dry!' : state === 'IDEAL' ? 'Perfect!' : 'Unknown';

  const pct = fillPct == null ? 50 : Math.max(0, Math.min(100, fillPct));
  const fillHeightPct = pct;
  const overIntensity = state === 'OVER' ? 1 : 0;
  const underIntensity = state === 'UNDER' ? 1 : 0;

  return (
    <View style={[styles.card, { backgroundColor: dark ? Colors.dark.card : Colors.light.card }]}>
      <Text style={[styles.title, { color: dark ? Colors.dark.text : Colors.light.text }]}>{title}</Text>
      <View style={styles.cauldronWrap}>
        {/* Animated outer glow */}
        <Animated.View style={[styles.glow, { 
          shadowColor: glowColor,
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.15 + 0.15 * overIntensity, 0.35 + 0.15 * overIntensity] }),
          transform: [
            { scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
          ],
        }]} />

        {/* Cauldron body */}
        <Animated.View style={[styles.cauldronBody, { 
          borderColor: dark ? '#1F2937' : '#2F2F2F', 
          backgroundColor: dark ? '#0B0F14' : '#0E1114',
          transform: [{ rotate: tilt.interpolate({ inputRange: [0,1], outputRange: ['-0.6deg','0.6deg'] }) as any }],
          shadowOpacity: 0.45 + 0.15 * overIntensity,
        }]}> 
          {/* Rim */}
          <View style={[styles.rim, { borderColor: dark ? '#2B3540' : '#3B3F46', backgroundColor: dark ? '#11161B' : '#12161B' }]} />
          <Animated.View style={[styles.rimShine, {
            opacity: shimmer.interpolate({ inputRange: [0,1], outputRange: [0.15, 0.45] }),
            transform: [{ translateX: shimmer.interpolate({ inputRange: [0,1], outputRange: [-30, 30] }) }],
          }]} />

          {/* Handles */}
          <View style={[styles.handle, { left: -10, borderColor: dark ? '#2B3540' : '#3B3F46' }]} />
          <View style={[styles.handle, { right: -10, borderColor: dark ? '#2B3540' : '#3B3F46' }]} />

          {/* Inner cavity with liquid */}
          <View style={styles.cauldronInner}>
            {/* Threshold tickers with labels */}
            <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
              <View style={[styles.tickContainer, { bottom: `${thresholds.under}%` }]}> 
                <View style={[styles.tick, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.tickLabel, { color: '#EF4444' }]}>MIN</Text>
              </View>
              <View style={[styles.tickContainer, { bottom: `${thresholds.over}%` }]}> 
                <View style={[styles.tick, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.tickLabel, { color: '#F59E0B' }]}>MAX</Text>
              </View>
            </View>
            {/* Liquid surface ripple */}
            <Animated.View
              style={[styles.surface, {
                backgroundColor: color + 'AA',
                transform: [
                  { translateY: surface.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                  { skewX: surface.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) as any },
                ],
              }]}
            />

            <View pointerEvents="none" style={[styles.liquidHighlight, { opacity: 0.18 + 0.12 * (state === 'IDEAL' ? 1 : 0) }]} />

            {/* Liquid fill */}
            <View style={[styles.fill, { height: `${fillHeightPct}%`, backgroundColor: color + '88' }]} />

            {/* Bubbles */}
            <Animated.View
              style={[styles.bubble, {
                backgroundColor: color,
                opacity: bubble1.interpolate({ inputRange: [0, 1], outputRange: [0.0, 0.95] }),
                transform: [
                  { translateY: bubble1.interpolate({ inputRange: [0, 1], outputRange: [24, -46] }) },
                  { translateX: bubble1.interpolate({ inputRange: [0, 1], outputRange: [-12, 10] }) },
                  { scale: bubble1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.05] }) },
                ],
              }]}
            />
            <Animated.View
              style={[styles.bubble, {
                backgroundColor: color,
                opacity: bubble2.interpolate({ inputRange: [0, 1], outputRange: [0.0, 0.9] }),
                transform: [
                  { translateY: bubble2.interpolate({ inputRange: [0, 1], outputRange: [18, -34] }) },
                  { translateX: bubble2.interpolate({ inputRange: [0, 1], outputRange: [8, -8] }) },
                  { scale: bubble2.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] }) },
                ],
              }]}
            />
            <Animated.View
              style={[styles.bubble, {
                backgroundColor: color,
                opacity: bubble3.interpolate({ inputRange: [0, 1], outputRange: [0.0, 0.8] }),
                transform: [
                  { translateY: bubble3.interpolate({ inputRange: [0, 1], outputRange: [26, -28] }) },
                  { translateX: bubble3.interpolate({ inputRange: [0, 1], outputRange: [-4, 6] }) },
                  { scale: bubble3.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.75] }) },
                ],
              }]}
            />
          </View>
        </Animated.View>

        {/* Flames under cauldron */}
        <Animated.View style={[styles.flameRow, {
          transform: [{ scaleY: flames.interpolate({ inputRange: [0, 1], outputRange: [1 + 0.2 * underIntensity, 1.15 + 0.25 * underIntensity] }) }],
          opacity: flames.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }),
        }]}> 
          <View style={[styles.flame, { backgroundColor: '#F59E0B' }]} />
          <View style={[styles.flame, { backgroundColor: '#FB923C' }]} />
          <View style={[styles.flame, { backgroundColor: '#F59E0B' }]} />
        </Animated.View>

        {/* Steam rising */}
        <Animated.View style={[styles.steam, {
          opacity: steam1.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5 + 0.2 * overIntensity] }),
          transform: [
            { translateY: steam1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
            { translateX: steam1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
            { scale: steam1.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
          ],
        }]} />
        <Animated.View style={[styles.steam, {
          opacity: steam2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45 + 0.2 * overIntensity] }),
          transform: [
            { translateY: steam2.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
            { translateX: steam2.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
            { scale: steam2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.95] }) },
          ],
        }]} />

        {state === 'OVER' && (
          <>
            <Animated.View style={[styles.droplet, {
              backgroundColor: color,
              opacity: overflow1.interpolate({ inputRange: [0,1], outputRange: [0, 0.9] }),
              transform: [
                { translateY: overflow1.interpolate({ inputRange: [0,1], outputRange: [0, 26] }) },
                { translateX: overflow1.interpolate({ inputRange: [0,1], outputRange: [0, -8] }) },
                { scale: overflow1.interpolate({ inputRange: [0,1], outputRange: [0.8, 1.1] }) },
              ],
            }]} />
            <Animated.View style={[styles.droplet, {
              backgroundColor: color,
              opacity: overflow2.interpolate({ inputRange: [0,1], outputRange: [0, 0.85] }),
              transform: [
                { translateY: overflow2.interpolate({ inputRange: [0,1], outputRange: [0, 30] }) },
                { translateX: overflow2.interpolate({ inputRange: [0,1], outputRange: [0, 10] }) },
                { scale: overflow2.interpolate({ inputRange: [0,1], outputRange: [0.8, 1.05] }) },
              ],
            }]} />
          </>
        )}

        {state === 'UNDER' && (
          <Animated.View style={[styles.heatHaze, {
            opacity: shimmer.interpolate({ inputRange: [0,1], outputRange: [0.08, 0.2] }),
            transform: [
              { translateY: shimmer.interpolate({ inputRange: [0,1], outputRange: [0, -4] }) },
              { scaleX: shimmer.interpolate({ inputRange: [0,1], outputRange: [1, 1.03] }) },
            ],
          }]} />
        )}

        {/* Floating mystical particles */}
        <Animated.View style={[styles.particle, {
          backgroundColor: glowColor,
          opacity: particle1.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
          transform: [
            { translateY: particle1.interpolate({ inputRange: [0, 1], outputRange: [10, -50] }) },
            { translateX: particle1.interpolate({ inputRange: [0, 1], outputRange: [-20, 15] }) },
            { scale: particle1.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) },
          ],
        }]} />
        <Animated.View style={[styles.particle, {
          backgroundColor: glowColor,
          opacity: particle2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
          transform: [
            { translateY: particle2.interpolate({ inputRange: [0, 1], outputRange: [5, -45] }) },
            { translateX: particle2.interpolate({ inputRange: [0, 1], outputRange: [25, -10] }) },
            { scale: particle2.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] }) },
          ],
        }]} />
        <Animated.View style={[styles.particle, {
          backgroundColor: glowColor,
          opacity: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, 0.65] }),
          transform: [
            { translateY: particle3.interpolate({ inputRange: [0, 1], outputRange: [8, -40] }) },
            { translateX: particle3.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
            { scale: particle3.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] }) },
          ],
        }]} />
      </View>

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: color + '22', borderColor: color }]}>
        <Text style={[styles.statusEmoji]}>{statusEmoji}</Text>
        <Text style={[styles.statusText, { color }]}>{statusText}</Text>
      </View>
      <Text style={[styles.caption, { color: dark ? '#9BA1A6' : '#687076' }]}> 
        {fillPct == null ? '—' : `${Math.round(fillPct)}%`} moisture
      </Text>
      <View style={[styles.sparkleRow]}>
        <Text style={[styles.sparkle, { color }]}>✦</Text>
        <Text style={[styles.sparkle, { color }]}>✧</Text>
        <Text style={[styles.sparkle, { color }]}>✦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  cauldronWrap: {
    alignItems: 'center',
  },
  cauldronBody: {
    width: 200,
    height: 200,
    borderRadius: 24,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  rim: {
    position: 'absolute',
    top: -8,
    left: 8,
    right: 8,
    height: 18,
    borderWidth: 3,
    borderRadius: 12,
  },
  rimShine: {
    position: 'absolute',
    top: -2,
    left: 16,
    right: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF20',
  },
  handle: {
    position: 'absolute',
    top: 38,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  cauldronInner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  surface: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: undefined,
    top: 56,
  },
  fill: {
    width: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  liquidHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48,
    height: 18,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  tickContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tick: {
    flex: 1,
    height: 3,
    opacity: 0.8,
    borderRadius: 2,
    marginRight: 4,
  },
  tickLabel: {
    fontSize: 9,
    fontWeight: '800',
    opacity: 0.9,
  },
  bubble: {
    position: 'absolute',
    bottom: 30,
    left: 70,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  droplet: {
    position: 'absolute',
    top: 18,
    width: 10,
    height: 14,
    borderRadius: 5,
    left: 110,
  },
  legs: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leg: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  flameRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  flame: {
    width: 10,
    height: 14,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  steam: {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
    opacity: 0.25,
  },
  heatHaze: {
    position: 'absolute',
    top: -2,
    left: 20,
    right: 20,
    height: 16,
    backgroundColor: '#FF000020',
    borderRadius: 8,
  },
  particle: {
    position: 'absolute',
    top: 40,
    left: 50,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 2,
    gap: 6,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  caption: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  sparkleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sparkle: {
    fontSize: 16,
    fontWeight: '700',
  },
});

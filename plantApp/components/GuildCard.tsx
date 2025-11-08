import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Guild } from '@/store/useAppStore';

interface GuildCardProps {
  guild: Guild;
  onPress: () => void;
}

export function GuildCard({ guild, onPress }: GuildCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.emblem, { backgroundColor: guild.emblem }]}>
        <Text style={styles.emblemText}>{guild.name.charAt(0)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          {guild.name}
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              Members
            </Text>
            <Text style={[styles.statValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {guild.memberCount || guild.members?.length || 0}
            </Text>
          </View>

          {guild.totalScore !== undefined && (
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                Total Score
              </Text>
              <Text style={[styles.statValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {guild.totalScore.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emblem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emblemText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  score: number;
  avatarUri?: string | null;
  onPress?: () => void;
}

export function LeaderboardRow({ rank, name, score, avatarUri, onPress }: LeaderboardRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return isDark ? Colors.dark.text : Colors.light.text;
  };

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, { color: getRankColor(rank) }]}>#{rank}</Text>
      </View>

      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: BrandColors.amethyst }]}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.name, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        {name}
      </Text>

      <View style={[styles.scoreBubble, { backgroundColor: BrandColors.emerald }]}>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
      </View>

      {rank === 1 && <Text style={styles.confetti}>✨</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  confetti: {
    fontSize: 20,
    marginLeft: 8,
  },
});

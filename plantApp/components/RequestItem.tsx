import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';

interface RequestItemProps {
  username: string;
  type: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onDecline?: () => void;
}

export function RequestItem({ username, type, onAccept, onDecline }: RequestItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAccept?.();
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecline?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
      <View style={[styles.avatar, { backgroundColor: BrandColors.amethyst }]}>
        <Text style={styles.avatarText}>{username.charAt(0)}</Text>
      </View>

      <Text style={[styles.username, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        {username}
      </Text>

      {type === 'incoming' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={handleDecline}
            activeOpacity={0.7}>
            <Text style={[styles.buttonText, { color: '#FF5252' }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.pendingBadge, { backgroundColor: isDark ? '#1E2528' : '#F0F0F0' }]}>
          <Text style={[styles.pendingText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
            Pending
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: BrandColors.emerald,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

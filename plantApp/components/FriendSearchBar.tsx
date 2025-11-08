import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';

interface FriendSearchBarProps {
  onSend: (username: string) => void;
}

export function FriendSearchBar({ onSend }: FriendSearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [username, setUsername] = useState('');

  const handleSend = () => {
    if (username.trim()) {
      onSend(username.trim());
      setUsername('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}>
      <TextInput
        style={[styles.input, { color: isDark ? Colors.dark.text : Colors.light.text }]}
        placeholder="Add friend by username"
        placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
        value={username}
        onChangeText={setUsername}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: BrandColors.amethyst }]}
        onPress={handleSend}
        activeOpacity={0.7}>
        <Ionicons name="send" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

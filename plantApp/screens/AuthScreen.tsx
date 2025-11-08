import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { setAuthenticated, setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth0Login = () => {
    setLoading(true);
    setTimeout(() => {
      Alert.alert('Auth0 (stub)', 'Auth0 integration coming soon. Use Dev Demo for now.');
      setLoading(false);
    }, 500);
  };

  const handleDevDemo = () => {
    setUser({
      id: 'demo-user',
      name: 'Demo User',
      avatarUri: null,
    });
    setAuthenticated(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: BrandColors.emerald }]}>
          <Text style={styles.logoText}>CC</Text>
        </View>

        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          CauldronCare
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          Brew vitality in Poyo's greenhouse-factory
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                color: isDark ? Colors.dark.text : Colors.light.text,
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                color: isDark ? Colors.dark.text : Colors.light.text,
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: BrandColors.amethyst }]}
            onPress={handleAuth0Login}
            disabled={loading}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {loading ? 'Loading...' : 'Continue with Auth0'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                borderColor: BrandColors.mint,
              },
            ]}
            onPress={handleDevDemo}
            activeOpacity={0.8}>
            <Text style={[styles.secondaryButtonText, { color: BrandColors.mint }]}>
              Use Dev Demo Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

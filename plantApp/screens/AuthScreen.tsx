import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth0Config, isAuth0Configured, getRedirectUri } from '@/config/auth0';

// Complete the web browser authentication session
// This is required for Auth0 to work properly
WebBrowser.maybeCompleteAuthSession();

export function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { setAuthenticated, setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'form' | 'google'>('form');

  // Use Auth0's discovery endpoint for automatic configuration
  // Hooks must be called unconditionally at the top level
  const discovery = AuthSession.useAutoDiscovery(
    isAuth0Configured() ? `https://${auth0Config.domain}` : 'https://example.auth0.com'
  );

  // Check if Auth0 is configured on mount
  useEffect(() => {
    if (!isAuth0Configured()) {
      console.warn('Auth0 is not configured. Using hardcoded credentials from config/auth0.ts');
    }
  }, []);

  // Handle username/password login using Auth0 Resource Owner Password Grant
  const handleUsernamePasswordLogin = async () => {
    if (!isAuth0Configured()) {
      Alert.alert(
        'Auth0 Not Configured',
        'Please configure Auth0 credentials. See AUTH0_QUICK_SETUP.md for instructions.',
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Use Resource Owner Password Credentials (ROPC) grant
      // Note: This requires enabling ROPC in Auth0 Dashboard > Applications > Settings > Advanced Settings > Grant Types
      const tokenParams = new URLSearchParams({
        grant_type: 'password',
        username: email.trim(),
        password: password,
        client_id: auth0Config.clientId,
        scope: 'openid profile email',
        connection: 'Username-Password-Authentication', // Default Auth0 database connection
      });

      const tokenResponse = await fetch(`https://${auth0Config.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error_description || errorData.error || 'Login failed');
      }

      const tokens = await tokenResponse.json();
      const accessToken = tokens.access_token;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Fetch user info from Auth0
      const userInfoResponse = await fetch(`https://${auth0Config.domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await userInfoResponse.json();

      // Update app state with user data
      setUser({
        id: userInfo.sub || userInfo.user_id || `auth0|${Date.now()}`,
        name: userInfo.name || userInfo.nickname || userInfo.email || 'User',
        avatarUri: userInfo.picture || null,
      });

      setAuthenticated(true);
    } catch (error) {
      console.error('Auth0 login error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login using Auth0 Social Connection
  const handleGoogleLogin = async () => {
    if (!isAuth0Configured()) {
      Alert.alert(
        'Auth0 Not Configured',
        'Please configure Auth0 credentials. See AUTH0_QUICK_SETUP.md for instructions.',
      );
      return;
    }

    // Use the discovery endpoint (already loaded via hook)
    if (!discovery || !discovery.authorizationEndpoint) {
      Alert.alert('Error', 'Failed to load Auth0 configuration. Please check your domain.');
      return;
    }

    setLoading(true);
    setLoginMode('google');

    try {
      const redirectUri = getRedirectUri();

      // Create the authentication request with Google connection
      const request = new AuthSession.AuthRequest({
        clientId: auth0Config.clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        usePKCE: true,
        additionalParameters: {
          connection: 'google-oauth2', // Specify Google connection
        },
      });

      // Prompt the user to authenticate with Google
      const result = await request.promptAsync(discovery, {
        useProxy: Platform.OS === 'web',
      });

      if (result.type === 'success') {
        const code = result.params.code;
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        const codeVerifier = request.codeVerifier;
        
        if (!codeVerifier) {
          throw new Error('PKCE code verifier not found.');
        }

        // Exchange code for tokens
        const tokenParams = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: auth0Config.clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        });

        const tokenResponse = await fetch(`https://${auth0Config.domain}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokens = await tokenResponse.json();
        const accessToken = tokens.access_token;

        if (!accessToken) {
          throw new Error('No access token received');
        }

        // Fetch user info from Auth0
        const userInfoResponse = await fetch(`https://${auth0Config.domain}/userinfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();

        // Update app state with user data
        setUser({
          id: userInfo.sub || userInfo.user_id || `auth0|${Date.now()}`,
          name: userInfo.name || userInfo.nickname || userInfo.email || 'User',
          avatarUri: userInfo.picture || null,
        });

        setAuthenticated(true);
      } else if (result.type === 'error') {
        Alert.alert('Authentication Error', result.error?.message || 'Failed to authenticate with Google');
      } else if (result.type === 'cancel') {
        // User cancelled, do nothing
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setLoading(false);
      setLoginMode('form');
    }
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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Decorative background elements */}
      <View style={[styles.decorativeCircle1, { backgroundColor: isDark ? 'rgba(111, 91, 212, 0.1)' : 'rgba(111, 91, 212, 0.05)' }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: isDark ? 'rgba(14, 59, 46, 0.15)' : 'rgba(14, 59, 46, 0.08)' }]} />
      
      <View style={styles.content}>
        {/* Logo with enhanced styling */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoGlow, { backgroundColor: BrandColors.emerald + '40' }]} />
          <View style={[styles.logo, { backgroundColor: BrandColors.emerald }]}>
            <Ionicons name="leaf" size={42} color="#FFF" />
          </View>
        </View>

        <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          CauldronCare
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          Brew vitality in Poyo's greenhouse-factory
        </Text>

        <View style={styles.form}>
          {!isAuth0Configured() && (
            <View style={[styles.warningBox, { 
              backgroundColor: isDark ? '#3A2A1F' : '#FFF4E6', 
              borderColor: '#FFA500' 
            }]}>
              <Ionicons name="warning" size={20} color={isDark ? '#FFA500' : '#B8860B'} style={styles.warningIcon} />
              <Text style={[styles.warningText, { color: isDark ? '#FFA500' : '#B8860B' }]}>
                Auth0 not configured. Please set up your credentials (see AUTH0_SETUP.md)
              </Text>
            </View>
          )}

          {/* Username/Password Form */}
          <View style={styles.inputContainer}>
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
              autoCorrect={false}
              editable={!loading}
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
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { 
                backgroundColor: BrandColors.amethyst, 
                opacity: isAuth0Configured() && !loading ? 1 : 0.5,
                shadowColor: BrandColors.amethyst,
              }
            ]}
            onPress={handleUsernamePasswordLogin}
            disabled={loading || !isAuth0Configured()}
            activeOpacity={0.8}>
            {loading && loginMode === 'form' ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="reload" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>Logging in...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="log-in" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]} />
            <Text style={[styles.dividerText, { color: isDark ? '#9BA1A6' : '#687076' }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? Colors.dark.border : Colors.light.border }]} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              {
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
              },
            ]}
            onPress={handleGoogleLogin}
            disabled={loading || !isAuth0Configured()}
            activeOpacity={0.8}>
            {loading && loginMode === 'google' ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="reload" size={20} color={isDark ? Colors.dark.text : Colors.light.text} />
                <Text style={[styles.googleButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Connecting to Google...
                </Text>
              </View>
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.buttonIcon} />
                <Text style={[styles.googleButtonText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                  Login with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Dev Demo Button */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                borderColor: BrandColors.mint,
              },
            ]}
            onPress={handleDevDemo}
            activeOpacity={0.8}
            disabled={loading}>
            <Ionicons name="rocket" size={18} color={BrandColors.mint} style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, { color: BrandColors.mint }]}>
              Use Dev Demo Account
            </Text>
          </TouchableOpacity>

          {/* Footer text */}
          <Text style={[styles.footerText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            Secure authentication powered by Auth0
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
    opacity: 0.6,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -80,
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.emerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 56,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 8,
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
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  warningBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
});

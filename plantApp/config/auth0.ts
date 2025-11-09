import Constants from 'expo-constants';

// Auth0 Configuration
// For production, use environment variables in .env file:
// EXPO_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
// EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
// 
// Expo automatically loads .env files and makes EXPO_PUBLIC_* variables available
// Make sure to restart your development server after creating/updating .env file
export const auth0Config = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || 'genai-417362476507225.ca.auth0.com',
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || 'nnMNlW96qd2OINssQ5FOVc9cs8PtmPd8',
};

// Validate configuration
export const isAuth0Configured = (): boolean => {
  return !!(auth0Config.domain && auth0Config.clientId);
};

// Get the redirect URI for Auth0
// This should match what you configure in Auth0 Dashboard
export const getRedirectUri = (): string => {
  // For Expo, use the app scheme
  const scheme = Constants.expoConfig?.scheme || 'cauldroncare';
  return `${scheme}://auth`;
};


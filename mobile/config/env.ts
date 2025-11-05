import Constants from 'expo-constants';

/**
 * Environment Configuration
 * 
 * For local development:
 * - Uses localhost
 * 
 * For production (EAS builds):
 * - Set environment variables in EAS Secrets
 * - Or configure in app.json extra.apiUrl
 */

interface Config {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get API URL from app.json extra config or use defaults
const getApiUrl = (): string => {
  // Check if running in development mode
  if (__DEV__) {
    return 'http://localhost:8080/api/v1';
  }

  // Try to get from app.json extra config
  const configApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configApiUrl) {
    return configApiUrl;
  }

  // Fallback to production Railway URL
  return 'https://havnapi.up.railway.app/api/v1';
};

export const config: Config = {
  apiUrl: getApiUrl(),
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

// Log configuration on startup (only in development)
if (__DEV__) {
  console.log('📱 App Configuration:', {
    apiUrl: config.apiUrl,
    environment: config.isDevelopment ? 'development' : 'production',
  });
}

export default config;


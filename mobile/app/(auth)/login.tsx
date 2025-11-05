import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth0 } from '../../hooks/useAuth0';

/**
 * Auth0-based Login Screen
 * 
 * Uses Auth0's Universal Login with support for:
 * - Google OAuth
 * - Email/Password authentication
 * - Social connections (configurable in Auth0 dashboard)
 */

function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, isReady } = useAuth0();

  const handleLogin = async () => {
    try {
      await login();
      // Auth0 hook will handle the redirect and token exchange
      // Once successful, the auth state will update and user will be redirected to tabs
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>havn</Text>
        <Text style={styles.tagline}>Find your study spot at UW</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="school-outline" size={80} color="#6366f1" />
          <Text style={styles.welcomeTitle}>Welcome to Havn</Text>
          <Text style={styles.welcomeText}>
            Discover and share study spots at University of Waterloo
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="map" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Find nearby study spots</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color="#6366f1" />
            <Text style={styles.featureText}>See where friends are studying</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bookmark" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Save spots for later</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, (!isReady || isLoading) && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={!isReady || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={24} color="white" />
              <Text style={styles.loginButtonText}>Continue to Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          You'll be able to sign in with Google, email, or other methods
        </Text>

        <Text style={styles.privacyText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#111827',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
});

LoginScreen.displayName = 'LoginScreen';

export default LoginScreen;



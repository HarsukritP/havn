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
 * Sign Up Screen using Auth0
 * 
 * Auth0's Universal Login handles both signup and signin.
 * New users will automatically be prompted to create an account.
 */

function SignupScreen() {
  const router = useRouter();
  const { login, isLoading, error, isReady } = useAuth0();

  const handleSignup = async () => {
    try {
      await login();
      // Auth0 Universal Login will handle account creation if user doesn't exist
    } catch (err) {
      console.error('Signup error:', err);
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
          <Ionicons name="person-add-outline" size={80} color="#6366f1" />
          <Text style={styles.welcomeTitle}>Join Havn</Text>
          <Text style={styles.welcomeText}>
            Create an account to discover study spots and connect with the UWaterloo community
          </Text>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Sign up with Google in seconds</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Find and save your favorite spots</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>See where friends are studying</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Signup Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.signupButton, (!isReady || isLoading) && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={!isReady || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={24} color="white" />
              <Text style={styles.signupButtonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          You'll be able to sign up with Google, email, or other methods
        </Text>

        <Text style={styles.privacyText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  benefitsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
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
  signupButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  signupButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  signupButtonText: {
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

SignupScreen.displayName = 'SignupScreen';

export default SignupScreen;


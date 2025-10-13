import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

export const RegisterScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setAuth(data.user, data.token);
      navigation.navigate('MainTabs' as never);
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.error || 'Registration failed. Please try again.');
    },
  });

  const handleRegister = () => {
    setError('');
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    registerMutation.mutate({ full_name: fullName, email, password });
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.dark[900]} />
        </Pressable>

        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MapPin size={40} color={colors.primary[500]} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join the community and never waste time looking for study spots
          </Text>
        </View>

        {/* Register Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.gray[600]}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              textContentType="name"
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@university.edu"
              placeholderTextColor={colors.gray[600]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.gray[600]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              editable={!registerMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor={colors.gray[600]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textContentType="newPassword"
              editable={!registerMutation.isPending}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleRegister}
            style={[
              styles.registerButton,
              registerMutation.isPending && styles.registerButtonDisabled,
            ]}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: colors.light[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.dark[900],
  },
  errorContainer: {
    backgroundColor: colors.error[500] + '20',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error[500],
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  footer: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});


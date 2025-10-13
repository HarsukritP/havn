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
import { MapPin } from 'lucide-react-native';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setAuth(data.user, data.token);
      navigation.navigate('MainTabs' as never);
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.error || 'Login failed. Please try again.');
    },
  });

  const handleLogin = () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const handleRegisterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Register' as never);
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
        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MapPin size={48} color={colors.primary[500]} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Havn</Text>
          <Text style={styles.subtitle}>
            Find your perfect study spot in real-time
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
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
              editable={!loginMutation.isPending}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.gray[600]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              editable={!loginMutation.isPending}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            style={[
              styles.loginButton,
              loginMutation.isPending && styles.loginButtonDisabled,
            ]}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={handleRegisterPress} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
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
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[500] + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
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
  loginButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.light[200],
  },
  dividerText: {
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    color: colors.gray[600],
  },
  registerButton: {
    height: 52,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary[500],
  },
  footer: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Award,
  LogOut,
  Settings,
  Crown,
} from 'lucide-react-native';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { formatPoints } from '../../utils/formatters';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, clearAuth } = useAuthStore();

  const { data: profileData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: userService.getCurrentUser,
    enabled: !!user,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => userService.getLeaderboard('weekly', 10),
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await clearAuth();
      navigation.navigate('Login' as never);
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Clear local auth anyway
      await clearAuth();
      navigation.navigate('Login' as never);
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ]
    );
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to settings screen
  };

  const stats = profileData?.stats;
  const currentUser = profileData?.user || user;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Profile</Text>
          <Pressable onPress={handleSettingsPress} style={styles.settingsButton}>
            <Settings size={24} color={colors.dark[900]} />
          </Pressable>
        </View>
      </View>

      {/* Profile Card */}
      {currentUser && (
        <View style={[styles.profileCard, shadows.md]}>
          <View style={styles.avatarContainer}>
            <User size={40} color={colors.white} />
          </View>
          
          <Text style={styles.userName}>{currentUser.full_name}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          
          <View style={styles.pointsRow}>
            <Trophy size={24} color={colors.warning[500]} />
            <Text style={styles.points}>{formatPoints(currentUser.total_points)} points</Text>
          </View>
          
          <View style={styles.streakRow}>
            <Text style={styles.streakText}>🔥 {currentUser.current_streak} day streak</Text>
          </View>
        </View>
      )}

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, shadows.sm]}>
            <Target size={24} color={colors.primary[500]} />
            <Text style={styles.statNumber}>{stats.total_check_ins}</Text>
            <Text style={styles.statLabel}>Total Check-ins</Text>
          </View>

          <View style={[styles.statCard, shadows.sm]}>
            <TrendingUp size={24} color={colors.success[500]} />
            <Text style={styles.statNumber}>{Math.round(stats.accuracy_rate * 100)}%</Text>
            <Text style={styles.statLabel}>Accuracy Rate</Text>
          </View>

          <View style={[styles.statCard, shadows.sm]}>
            <Award size={24} color={colors.warning[500]} />
            <Text style={styles.statNumber}>{stats.check_ins_this_week}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={[styles.statCard, shadows.sm]}>
            <Crown size={24} color={colors.error[500]} />
            <Text style={styles.statNumber}>Top {stats.rank_percentile}%</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>
      )}

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
        
        <View style={[styles.leaderboardCard, shadows.md]}>
          {leaderboard.map((entry, index) => (
            <View
              key={entry.user_id}
              style={[
                styles.leaderboardItem,
                entry.is_current_user && styles.leaderboardItemHighlight,
                index < leaderboard.length - 1 && styles.leaderboardItemBorder,
              ]}
            >
              <View style={styles.leaderboardLeft}>
                <Text style={[
                  styles.rank,
                  entry.rank <= 3 && styles.rankTop,
                ]}>
                  #{entry.rank}
                </Text>
                <Text style={styles.leaderboardName}>{entry.full_name}</Text>
              </View>
              
              <Text style={styles.leaderboardPoints}>{formatPoints(entry.points)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Pressable onPress={handleLogout} style={[styles.logoutButton, shadows.sm]}>
          <LogOut size={20} color={colors.error[500]} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light[100],
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark[900],
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark[900],
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  points: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark[900],
  },
  streakRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warning[500] + '20',
    borderRadius: borderRadius.full,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark[900],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.md,
  },
  leaderboardCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  leaderboardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light[200],
  },
  leaderboardItemHighlight: {
    backgroundColor: colors.primary[500] + '10',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[600],
    width: 32,
  },
  rankTop: {
    color: colors.warning[500],
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark[900],
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[500],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error[500],
  },
  bottomPadding: {
    height: spacing['3xl'],
  },
});

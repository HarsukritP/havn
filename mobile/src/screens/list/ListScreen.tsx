import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { spotService } from '../../services/spotService';
import { Spot } from '../../types';
import { SpotCard } from '../../components/SpotCard';
import { SkeletonSpotCard } from '../../components/SkeletonSpotCard';
import { PointsBadge } from '../../components/PointsBadge';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, borderRadius } from '../../constants/theme';

export const ListScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();
  const { user } = useAuthStore();

  // Get user location
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Fetch nearby spots
  const { data: spots = [], isLoading, refetch } = useQuery({
    queryKey: ['spots', 'list', userLocation?.latitude, userLocation?.longitude],
    queryFn: () => {
      if (userLocation) {
        return spotService.getNearbySpots(userLocation.latitude, userLocation.longitude, 2000);
      }
      return spotService.getSpots({ page: 1, limit: 50 });
    },
    enabled: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSpotPress = (spot: Spot) => {
    navigation.navigate('Map' as never, { spotId: spot.id } as never);
  };

  const handleSearchPress = () => {
    // TODO: Implement search functionality
  };

  const handleFilterPress = () => {
    // TODO: Implement filter functionality
  };

  const renderSpot = ({ item }: { item: Spot }) => (
    <SpotCard
      spot={item}
      onPress={handleSpotPress}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Spots Found</Text>
      <Text style={styles.emptyText}>
        We couldn't find any study spots nearby. Try adjusting your location permissions.
      </Text>
    </View>
  );

  const renderSkeleton = () => (
    <>
      <SkeletonSpotCard />
      <SkeletonSpotCard />
      <SkeletonSpotCard />
      <SkeletonSpotCard />
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Study Spots</Text>
          <Text style={styles.subtitle}>
            {spots.length} spot{spots.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
        
        {user && <PointsBadge points={user.total_points} />}
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchBar}>
        <Pressable onPress={handleSearchPress} style={styles.searchButton}>
          <Search size={20} color={colors.gray[600]} />
          <Text style={styles.searchPlaceholder}>Search spots...</Text>
        </Pressable>
        
        <Pressable onPress={handleFilterPress} style={styles.filterButton}>
          <SlidersHorizontal size={20} color={colors.primary[500]} />
        </Pressable>
      </View>

      {/* Spots List */}
      {isLoading && !refreshing ? (
        <View style={styles.skeletonContainer}>
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={spots}
          renderItem={renderSpot}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light[200],
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.light[100],
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: colors.gray[600],
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[500] + '20',
    borderRadius: borderRadius.md,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  skeletonContainer: {
    paddingTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});

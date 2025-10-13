import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spot } from '../types';
import { colors } from '../constants/theme';

interface SpotMarkerProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
  index?: number;
}

export const SpotMarker: React.FC<SpotMarkerProps> = ({ spot, onPress, index = 0 }) => {
  const scale = useSharedValue(0);

  // Bounce-in animation on mount with stagger
  useEffect(() => {
    scale.value = withDelay(
      index * 50, // Stagger by 50ms
      withSpring(1, {
        damping: 8,
        stiffness: 100,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getMarkerColor = () => {
    const availabilityPercent = (spot.current_available || 0) / spot.total_capacity * 100;
    if (availabilityPercent > 50) return colors.success[500]; // Green
    if (availabilityPercent > 20) return colors.warning[500]; // Yellow
    return colors.error[500]; // Red
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(spot);
  };

  return (
    <Marker
      coordinate={{
        latitude: spot.latitude,
        longitude: spot.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={false} // Performance optimization
    >
      <Animated.View style={[styles.markerContainer, animatedStyle]}>
        <View style={[styles.markerCircle, { backgroundColor: getMarkerColor() }]}>
          <Text style={styles.markerText}>{spot.current_available || '?'}</Text>
        </View>
        <View style={[styles.markerTail, { backgroundColor: getMarkerColor() }]} />
      </Animated.View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});


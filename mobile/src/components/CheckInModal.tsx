import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { X, Volume2, VolumeX, Volume1 } from 'lucide-react-native';
import { Spot } from '../types';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface CheckInModalProps {
  visible: boolean;
  spot: Spot | null;
  onClose: () => void;
  onSubmit: (data: { seatsAvailable: number; noiseLevel?: 'quiet' | 'moderate' | 'loud' }) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  spot,
  onClose,
  onSubmit,
}) => {
  const [seatsAvailable, setSeatsAvailable] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState<'quiet' | 'moderate' | 'loud' | null>(null);

  const translateY = useSharedValue(MODAL_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(1, { duration: 200 });
      
      // Reset form
      if (spot) {
        setSeatsAvailable(spot.current_available || 0);
        setNoiseLevel(null);
      }
    } else {
      // Slide out
      translateY.value = withTiming(MODAL_HEIGHT, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow drag down
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        // Close modal
        translateY.value = withTiming(MODAL_HEIGHT, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onClose)();
        });
      } else {
        // Snap back
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSeatChange = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSeatsAvailable(Math.max(0, Math.min(spot?.total_capacity || 100, value)));
  };

  const handleNoiseLevelSelect = (level: 'quiet' | 'moderate' | 'loud') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNoiseLevel(level);
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    onSubmit({
      seatsAvailable,
      noiseLevel: noiseLevel || undefined,
    });
    
    onClose();
  };

  if (!spot) return null;

  const quickSelectValues = [0, Math.floor(spot.total_capacity * 0.25), Math.floor(spot.total_capacity * 0.5), Math.floor(spot.total_capacity * 0.75), spot.total_capacity];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.modal, animatedStyle]}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Update {spot.name}</Text>
                <Text style={styles.subtitle}>Help the community with real-time data</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.gray[600]} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seat Count Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available Seats</Text>
                
                {/* Quick Select Buttons */}
                <View style={styles.quickSelectRow}>
                  {quickSelectValues.map((value) => (
                    <Pressable
                      key={value}
                      onPress={() => handleSeatChange(value)}
                      style={[
                        styles.quickSelectButton,
                        seatsAvailable === value && styles.quickSelectButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickSelectText,
                          seatsAvailable === value && styles.quickSelectTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Large Number Display */}
                <View style={styles.seatCountDisplay}>
                  <Pressable
                    onPress={() => handleSeatChange(seatsAvailable - 1)}
                    style={styles.seatButton}
                  >
                    <Text style={styles.seatButtonText}>−</Text>
                  </Pressable>
                  
                  <Text style={styles.seatCount}>{seatsAvailable}</Text>
                  
                  <Pressable
                    onPress={() => handleSeatChange(seatsAvailable + 1)}
                    style={styles.seatButton}
                  >
                    <Text style={styles.seatButtonText}>+</Text>
                  </Pressable>
                </View>
                
                <Text style={styles.capacityText}>
                  out of {spot.total_capacity} total seats
                </Text>
              </View>

              {/* Noise Level Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Noise Level (Optional)</Text>
                
                <View style={styles.noiseLevelRow}>
                  <Pressable
                    onPress={() => handleNoiseLevelSelect('quiet')}
                    style={[
                      styles.noiseLevelButton,
                      noiseLevel === 'quiet' && styles.noiseLevelButtonActive,
                    ]}
                  >
                    <VolumeX size={24} color={noiseLevel === 'quiet' ? colors.white : colors.gray[600]} />
                    <Text
                      style={[
                        styles.noiseLevelText,
                        noiseLevel === 'quiet' && styles.noiseLevelTextActive,
                      ]}
                    >
                      Quiet
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleNoiseLevelSelect('moderate')}
                    style={[
                      styles.noiseLevelButton,
                      noiseLevel === 'moderate' && styles.noiseLevelButtonActive,
                    ]}
                  >
                    <Volume1 size={24} color={noiseLevel === 'moderate' ? colors.white : colors.gray[600]} />
                    <Text
                      style={[
                        styles.noiseLevelText,
                        noiseLevel === 'moderate' && styles.noiseLevelTextActive,
                      ]}
                    >
                      Moderate
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleNoiseLevelSelect('loud')}
                    style={[
                      styles.noiseLevelButton,
                      noiseLevel === 'loud' && styles.noiseLevelButtonActive,
                    ]}
                  >
                    <Volume2 size={24} color={noiseLevel === 'loud' ? colors.white : colors.gray[600]} />
                    <Text
                      style={[
                        styles.noiseLevelText,
                        noiseLevel === 'loud' && styles.noiseLevelTextActive,
                      ]}
                    >
                      Loud
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleSubmit} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit Update (+5 points)</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[600],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
  },
  closeButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark[900],
    marginBottom: spacing.md,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.light[200],
    alignItems: 'center',
  },
  quickSelectButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
  },
  quickSelectTextActive: {
    color: colors.white,
  },
  seatCountDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  seatButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  seatCount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.dark[900],
    marginHorizontal: spacing['2xl'],
    minWidth: 80,
    textAlign: 'center',
  },
  capacityText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray[600],
  },
  noiseLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  noiseLevelButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.light[200],
    alignItems: 'center',
    gap: spacing.sm,
  },
  noiseLevelButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  noiseLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  noiseLevelTextActive: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});


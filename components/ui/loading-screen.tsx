import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const LoadingScreenComponent = () => {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const scaleProgress = useSharedValue(0.8);
  const opacityProgress = useSharedValue(0.5);

  useEffect(() => {
    // Start both animations in parallel (they run independently)
    scaleProgress.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(0.8, { duration: 1000 })
      ),
      -1,
      false
    );

    opacityProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      false
    );
  }, [scaleProgress, opacityProgress]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleProgress.value }],
      opacity: opacityProgress.value,
    };
  });

  return (
    <ThemedView style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          animatedIconStyle,
        ]}
      >
        <Ionicons name="scan" size={64} color={tintColor} />
      </Animated.View>
      <ActivityIndicator
        size="large"
        color={tintColor}
        style={styles.spinner}
      />
      <ThemedText style={styles.loadingText}>Initializing Camera...</ThemedText>
      <ThemedText style={styles.subText}>
        Please wait while we set up the scanner
      </ThemedText>
    </ThemedView>
  );
};

export const LoadingScreen = memo(LoadingScreenComponent);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: '600',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
});


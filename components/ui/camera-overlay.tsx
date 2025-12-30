import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH * 0.75, 280);
const CORNER_LENGTH = 30;
const CORNER_WIDTH = 4;

interface CameraOverlayProps {
  isScanning?: boolean;
  torchEnabled?: boolean;
  onToggleTorch?: () => void;
}

const CameraOverlayComponent = ({
  isScanning = true,
  torchEnabled = false,
  onToggleTorch,
}: CameraOverlayProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const scanLineProgress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isScanning) {
      scanLineProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      );
    } else {
      scanLineProgress.value = 0;
    }
  }, [isScanning, scanLineProgress]);

  const animatedScanLineStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scanLineProgress.value,
      [0, 1],
      [0, SCAN_AREA_SIZE - 2]
    );
    return {
      transform: [{ translateY }],
    };
  });

  const overlayColor =useMemo(() => isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)', [isDark]);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={[styles.overlaySection, { backgroundColor: overlayColor }]}>
        {onToggleTorch && (
          <TouchableOpacity
            style={[
              styles.torchButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.3)',
                top: insets.top + 10,
              },
            ]}
            onPress={onToggleTorch}
            activeOpacity={0.7}
          >
            <Ionicons
              name={torchEnabled ? 'flash' : 'flash-off'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
        
      </View>
      
      <View style={styles.middleSection}>
      
        <View style={[styles.sideOverlay, { backgroundColor: overlayColor }]} />
        
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]}>
            <View style={[styles.cornerLine, styles.cornerTop, { backgroundColor: tintColor }]} />
            <View style={[styles.cornerLine, styles.cornerLeft, { backgroundColor: tintColor }]} />
          </View>
          
          <View style={[styles.corner, styles.topRight]}>
            <View style={[styles.cornerLine, styles.cornerTop, { backgroundColor: tintColor }]} />
            <View style={[styles.cornerLine, styles.cornerRight, { backgroundColor: tintColor }]} />
          </View>
          
          <View style={[styles.corner, styles.bottomLeft]}>
            <View style={[styles.cornerLine, styles.cornerBottom, { backgroundColor: tintColor }]} />
            <View style={[styles.cornerLine, styles.cornerLeft, { backgroundColor: tintColor }]} />
          </View>
          
          <View style={[styles.corner, styles.bottomRight]}>
            <View style={[styles.cornerLine, styles.cornerBottom, { backgroundColor: tintColor }]} />
            <View style={[styles.cornerLine, styles.cornerRight, { backgroundColor: tintColor }]} />
          </View>

          {isScanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  backgroundColor: tintColor,
                },
                animatedScanLineStyle,
              ]}
            />
          )}
        </View>
        
        <View style={[styles.sideOverlay, { backgroundColor: overlayColor }]} />
      </View>
      
      <View style={[styles.overlaySection, styles.bottomOverlay, { backgroundColor: overlayColor }]}>
        <ThemedText style={styles.instructionText}>
          Position the barcode within the frame
        </ThemedText>
        <ThemedText style={styles.hintText}>
          Make sure the barcode is well-lit and in focus
        </ThemedText>
      </View>
    </View>
  );
};

export const CameraOverlay = memo(CameraOverlayComponent);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlaySection: {
    width: '100%',
    flex: 1,
  },
  middleSection: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    flex: 1,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  cornerLine: {
    position: 'absolute',
    backgroundColor: '#0a7ea4',
  },
  cornerTop: {
    top: 0,
    left: 0,
    width: CORNER_LENGTH,
    height: CORNER_WIDTH,
  },
  cornerBottom: {
    bottom: 0,
    left: 0,
    width: CORNER_LENGTH,
    height: CORNER_WIDTH,
  },
  cornerLeft: {
    top: 0,
    left: 0,
    width: CORNER_WIDTH,
    height: CORNER_LENGTH,
  },
  cornerRight: {
    top: 0,
    right: 0,
    width: CORNER_WIDTH,
    height: CORNER_LENGTH,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  bottomOverlay: {
    justifyContent: 'flex-end',
    paddingBottom: 60,
    alignItems: 'center',
  },
  torchButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});


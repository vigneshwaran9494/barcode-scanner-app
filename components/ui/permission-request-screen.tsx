import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { openAppSettings } from './camera-utils';

interface PermissionRequestScreenProps {
  onRequestPermission: () => void;
  permissionDenied: boolean;
}

const PermissionRequestScreenComponent = ({
  onRequestPermission,
  permissionDenied,
}: PermissionRequestScreenProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = useThemeColor({ light: '#0a7ea4', dark: '#fff' }, 'tint');

  if (permissionDenied) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}>
            <ThemedText style={styles.iconText}>📷</ThemedText>
          </View>
          
          <ThemedText type="title" style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          
          <ThemedText style={styles.permissionDescription}>
            Camera access was denied. To scan barcodes, please enable camera permission in your device settings.
          </ThemedText>

          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: tintColor }]}
            onPress={openAppSettings}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.settingsButtonText}>Open Settings</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.retryButton, { borderColor: tintColor }]}
            onPress={onRequestPermission}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.retryButtonText, { color: tintColor }]}>
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.permissionContainer}>
      <View style={styles.permissionContent}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}>
          <ThemedText style={styles.iconText}>📷</ThemedText>
        </View>
        
        <ThemedText type="title" style={styles.permissionTitle}>
          Camera Access Needed
        </ThemedText>
        
        <ThemedText style={styles.permissionDescription}>
          We need access to your camera to scan barcodes. Please grant camera permission to continue.
        </ThemedText>

        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: '#0a7ea4' }]}
          onPress={onRequestPermission}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

export const PermissionRequestScreen = memo(PermissionRequestScreenComponent);

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionDescription: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  permissionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


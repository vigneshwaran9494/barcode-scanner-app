import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const NoCameraDeviceErrorComponent = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <ThemedView style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}>
          <ThemedText style={styles.iconText}>⚠️</ThemedText>
        </View>
        
        <ThemedText type="title" style={styles.errorTitle}>
          No Camera Available
        </ThemedText>
        
        <ThemedText style={styles.errorDescription}>
          No camera device was found on this device. Please ensure your device has a working camera.
        </ThemedText>
      </View>
    </ThemedView>
  );
};

export const NoCameraDeviceError = memo(NoCameraDeviceErrorComponent);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
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
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDescription: {
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
  },
});


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {
    Camera,
    CameraPosition,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';

/**
 * Opens the app settings on both iOS and Android
 */
async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('Failed to open settings:', error);
    Alert.alert(
      'Unable to Open Settings',
      'Please manually open Settings and grant camera permission to this app.',
    );
  }
}

/**
 * Permission Request Screen Component
 */
function PermissionRequestScreen({
  onRequestPermission,
  permissionDenied,
}: {
  onRequestPermission: () => void;
  permissionDenied: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
            style={[styles.settingsButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={openAppSettings}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.settingsButtonText}>Open Settings</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.retryButton, { borderColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={onRequestPermission}
            activeOpacity={0.8}
          >
            <ThemedText style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
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
          style={[styles.permissionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={onRequestPermission}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

/**
 * Loading Screen Component
 */
function LoadingScreen() {
  return (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0a7ea4" />
      <ThemedText style={styles.loadingText}>Initializing Camera...</ThemedText>
    </ThemedView>
  );
}

/**
 * No Camera Device Error Screen
 */
function NoCameraDeviceError() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemedView style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
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
}

/**
 * Main Camera View Component
 */
export function CameraView() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  
  const device = useCameraDevice(cameraPosition);
  const colorScheme = useColorScheme();

  // Code Scanner - must be called at top level (Rules of Hooks)
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      console.log(`Scanned ${codes.length} codes!`);
    },
  });

  // Check initial permission state
  useEffect(() => {
    const checkPermission = async () => {
      setIsInitializing(false);
    };
    checkPermission();
  }, []);

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (!result) {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionDenied(true);
    }
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show permission request screen if permission not granted
  if (!hasPermission) {
    return (
      <PermissionRequestScreen
        onRequestPermission={handleRequestPermission}
        permissionDenied={permissionDenied}
      />
    );
  }

  // Show error if no camera device available
  if (device == null) {
    return <NoCameraDeviceError />;
  }

  // Render camera view
  return (
    <View style={styles.cameraContainer}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        enableZoomGesture={true}
        codeScanner={codeScanner}
      />
      
      {/* Optional: Add overlay UI here for barcode scanning */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* You can add scanning frame, instructions, etc. here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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

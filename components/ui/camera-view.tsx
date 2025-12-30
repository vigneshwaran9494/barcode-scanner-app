import { SUPPORTED_BARCODE_TYPES } from '@/constants/constants';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  CameraPosition,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  type Code,
  type CodeScannerFrame,
} from 'react-native-vision-camera';
import { CameraOverlay } from './camera-overlay';
import { LoadingScreen } from './loading-screen';
import { NoCameraDeviceError } from './no-camera-device-error';
import { PermissionRequestScreen } from './permission-request-screen';
import { ScanResultModal } from './scan-result-modal';

/**
 * Main Camera View Component
 */
export function CameraView() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraPosition] = useState<CameraPosition>('back');
  const [scannedCode, setScannedCode] = useState<Code | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const lastScannedValue = useRef<string | null>(null);
  
  const device = useCameraDevice(cameraPosition);

  // Code Scanner Callback
  const onCodeScanned = useCallback((codes: Code[], frame: CodeScannerFrame) => {
    if (codes.length > 0 && !showResultModal) {
      const code = codes[0];
      
      // Prevent duplicate scans of the same code
      if (code.value && code.value !== lastScannedValue.current) {
        lastScannedValue.current = code.value;
        setScannedCode(code);
        setShowResultModal(true);
        setIsScanning(false);
        
        // Haptic Feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [showResultModal]);

  const codeScanner = useCodeScanner({
    codeTypes: SUPPORTED_BARCODE_TYPES,
    onCodeScanned,
  });

  // Check initial permission state
  useEffect(() => {
    const checkPermission = async () => {
      setIsInitializing(false);
    };
    checkPermission();
  }, []);

  // Handle permission request - memoized with useCallback
  const handleRequestPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      if (!result) {
        setPermissionDenied(true);
      } else {
        setPermissionDenied(false);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionDenied(true);
    }
  }, [requestPermission]);

  const handleCloseModal = useCallback(() => {
    setShowResultModal(false);
    // Reset after a delay to allow scanning again
    setTimeout(() => {
      setIsScanning(true);
      lastScannedValue.current = null;
    }, 1000);
  }, []);

  const cameraProps = useMemo(
    () => ({
      style: styles.camera,
      device: device!,
      isActive: true,
      enableZoomGesture: true,
      codeScanner,
      torch: (torchEnabled ? 'on' : 'off') as 'on' | 'off',
    }),
    [device, codeScanner, torchEnabled],
  );

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!hasPermission) {
    return (
      <PermissionRequestScreen
        onRequestPermission={handleRequestPermission}
        permissionDenied={permissionDenied}
      />
    );
  }

  if (device == null) {
    return <NoCameraDeviceError />;
  }

  // Toggle Torch Callback
  const handleToggleTorch = useCallback(() => {
    setTorchEnabled((prev) => !prev);
  }, []);

  // Render the camera view
  return (
    <View style={styles.cameraContainer}>
      <Camera {...cameraProps} />
      <CameraOverlay
        isScanning={isScanning}
        torchEnabled={torchEnabled}
        onToggleTorch={handleToggleTorch}
      />
      <ScanResultModal
        visible={showResultModal}
        code={scannedCode}
        onClose={handleCloseModal}
      />
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
});

import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
  type CodeType,
} from 'react-native-vision-camera';

import { SUPPORTED_BARCODE_TYPES } from '@/constants/constants';
import { BarcodeHistoryService } from '@/services/barcode-history';
import { BarcodeSettingsService } from '@/services/barcode-settings';

import { useAppState } from '@/hooks/use-app-state';
import { CameraOverlay } from './camera-overlay';
import {
  isValidBarcodeFormat,
  normalizeBarcodeType,
} from './camera-utils';
import { LoadingScreen } from './loading-screen';
import { NoCameraDeviceError } from './no-camera-device-error';
import { PermissionRequestScreen } from './permission-request-screen';
import { ScanResultModal } from './scan-result-modal';

export function CameraView() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraPosition] = useState<CameraPosition>('back');
  const [scannedCode, setScannedCode] = useState<Code | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [enabledTypes, setEnabledTypes] = useState<CodeType[]>(SUPPORTED_BARCODE_TYPES);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const lastScannedValue = useRef<string | null>(null);
  
  const device = useCameraDevice(cameraPosition);

  const isFocused = useIsFocused()
  const appState = useAppState()
  const isActive = useMemo(() => isFocused && appState === "active", [isFocused, appState]);

  const loadSettings = useCallback(async () => {
    try {
      const types = await BarcodeSettingsService.getEnabledTypes();
      setEnabledTypes(types);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  const handleRequestPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      setPermissionDenied(!result);
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionDenied(true);
    }
  }, [requestPermission]);

  const handleCloseModal = useCallback(() => {
    setShowResultModal(false);
    setTimeout(() => {
      setIsScanning(true);
      lastScannedValue.current = null;
    }, 1000);
  }, []);

  const handleToggleTorch = useCallback(() => {
    setTorchEnabled((prev) => !prev);
  }, []);

  // handle code scanned
  const onCodeScanned = useCallback((codes: Code[]) => {
    if (codes.length === 0 || showResultModal) return;

    const code = codes[0];
    if (!code.value || code.value === lastScannedValue.current) return;

    lastScannedValue.current = code.value;
    const normalized = normalizeBarcodeType(code.type as CodeType, code.value);
    const validation = isValidBarcodeFormat(normalized.type, normalized.value);

    const normalizedCode: Code = {
      ...code,
      type: normalized.type,
      value: normalized.value,
    };

    setScannedCode(normalizedCode);
    setValidationError(validation.isValid ? undefined : validation.error);
    setShowResultModal(true);
    setIsScanning(false);

    BarcodeHistoryService.saveBarcode({
      type: normalized.type,
      value: normalized.value || '',
      isValid: validation.isValid,
      ...(validation.error && { error: validation.error }),
    }).catch((error) => {
      console.error('Error saving to history:', error);
    });

    Haptics.notificationAsync(
      validation.isValid
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  }, [showResultModal]);

  const codeScanner = useCodeScanner({
    codeTypes: enabledTypes.length > 0 ? enabledTypes : SUPPORTED_BARCODE_TYPES,
    onCodeScanned,
  });

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const cameraProps = useMemo(
    () => ({
      style: styles.camera,
      device: device!,
      isActive,
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
        validationError={validationError}
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

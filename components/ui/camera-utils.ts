import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import type { CodeType } from 'react-native-vision-camera';

/**
 * Opens the app settings on both iOS and Android
 */
export async function openAppSettings(): Promise<void> {
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
 * Normalizes barcode type and value based on platform-specific behavior
 * iOS: EAN-13 codes starting with '0' are actually UPC-A codes
 * Android: ITF codes with 14 characters should be treated as ITF-14
 */
export function normalizeBarcodeType(
  type: CodeType | 'unknown',
  value: string | undefined,
): { type: CodeType | 'unknown'; value: string | undefined } {
  if (!value) {
    return { type, value };
  }

  // iOS: Convert EAN-13 to UPC-A if it starts with '0' and has 13 digits
  if (Platform.OS === 'ios' && type === 'ean-13') {
    const converted = convertEAN13ToUPCA(value);
    if (converted) {
      return { type: 'upc-a', value: converted };
    }
  }

  // Android: Validate ITF codes with 14 characters as ITF-14
  if (Platform.OS === 'android' && type === 'itf') {
    if (validateITF14(value)) {
      return { type: 'itf-14', value };
    }
  }

  return { type, value };
}

/**
 * Converts EAN-13 code to UPC-A by removing leading '0'
 * EAN-13 is a superset of UPC-A with an extra 0 digit at the front
 */
export function convertEAN13ToUPCA(value: string): string | null {
  // Check if value starts with '0' and has exactly 13 digits
  if (value.length === 13 && value.startsWith('0') && /^\d+$/.test(value)) {
    // Remove leading '0' to get 12-digit UPC-A code
    return value.substring(1);
  }
  return null;
}

/**
 * Validates if a value is a valid ITF-14 format (exactly 14 characters)
 */
export function validateITF14(value: string): boolean {
  // ITF-14 always encodes 14 characters
  return value.length === 14;
}

/**
 * Validates barcode format based on type
 */
export function isValidBarcodeFormat(
  type: CodeType | 'unknown',
  value: string | undefined,
): { isValid: boolean; error?: string } {
  if (!value) {
    return { isValid: false, error: 'Barcode value is empty' };
  }

  if (type === 'unknown') {
    return { isValid: false, error: 'Unsupported barcode format' };
  }

  // Basic format validation based on type
  switch (type) {
    case 'upc-a':
      // UPC-A: exactly 12 digits
      if (!/^\d{12}$/.test(value)) {
        return { isValid: false, error: 'Invalid UPC-A format (must be 12 digits)' };
      }
      break;

    case 'ean-13':
      // EAN-13: exactly 13 digits
      if (!/^\d{13}$/.test(value)) {
        return { isValid: false, error: 'Invalid EAN-13 format (must be 13 digits)' };
      }
      break;

    case 'ean-8':
      // EAN-8: exactly 8 digits
      if (!/^\d{8}$/.test(value)) {
        return { isValid: false, error: 'Invalid EAN-8 format (must be 8 digits)' };
      }
      break;

    case 'itf-14':
      // ITF-14: exactly 14 characters (usually digits)
      if (value.length !== 14) {
        return { isValid: false, error: 'Invalid ITF-14 format (must be 14 characters)' };
      }
      break;

    case 'code-128':
    case 'code-39':
    case 'code-93':
      // These can contain various characters, just check minimum length
      if (value.length < 1) {
        return { isValid: false, error: `Invalid ${type} format` };
      }
      break;

    case 'qr':
    case 'aztec':
    case 'data-matrix':
    case 'pdf-417':
      // 2D codes can contain various content, just check not empty
      if (value.length < 1) {
        return { isValid: false, error: `Invalid ${type} format` };
      }
      break;

    default:
      // For other types, just check not empty
      if (value.length < 1) {
        return { isValid: false, error: 'Invalid barcode format' };
      }
  }

  return { isValid: true };
}


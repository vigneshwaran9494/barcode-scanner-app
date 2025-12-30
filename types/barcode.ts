import type { CodeType } from 'react-native-vision-camera';

/**
 * Barcode data structure for history storage
 */
export interface BarcodeData {
  id: string;
  type: CodeType | 'unknown';
  value: string;
  timestamp: number;
  isValid: boolean;
  error?: string;
}


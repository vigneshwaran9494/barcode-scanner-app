import { Platform } from "react-native";
import { CodeType } from "react-native-vision-camera";

export const DEFAULT_BARCODE_TYPES_IOS: CodeType[] = [
  'aztec',
  'codabar',
  'code-128',
  'code-39',
  'code-93',
  'data-matrix',
  'ean-13',
  'ean-8',
  'gs1-data-bar-expanded',
  'gs1-data-bar-limited',
  'itf',
  'itf-14',
  'pdf-417',
  'qr',
  'upc-a',
  'upc-e',
];

export const DEFAULT_BARCODE_TYPES_ANDROID: CodeType[] = [
  'aztec',
  'codabar',
  'code-128',
  'code-39',
  'code-93',
  'data-matrix',
  'ean-13',
  'ean-8',
  'itf',
  'pdf-417',
  'qr',
  'upc-a',
  'upc-e',
];


export const SUPPORTED_BARCODE_TYPES: CodeType[] = Platform.OS === 'ios' ? DEFAULT_BARCODE_TYPES_IOS : DEFAULT_BARCODE_TYPES_ANDROID;

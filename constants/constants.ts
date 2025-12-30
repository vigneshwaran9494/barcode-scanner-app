import { Platform } from "react-native";
import { CodeType } from "react-native-vision-camera";

export const DEFAULT_BARCODE_TYPES_IOS: CodeType[] = [
  'qr',
  'upc-a',
  'ean-13',
  'ean-8',
  'code-128',
  'code-39',
  'code-93',
  'itf',
  'itf-14',
  'pdf-417',
  'aztec',
  'data-matrix',
  'codabar',
  'upc-e',
];

export const DEFAULT_BARCODE_TYPES_ANDROID: CodeType[] = [
  'qr',
  'upc-a',
  'ean-13',
  'ean-8',
  'code-128',
  'code-39',
  'code-93',
  'itf',
  'pdf-417',
  'aztec',
  'data-matrix',
  'codabar',
  'upc-e',
];


export const SUPPORTED_BARCODE_TYPES: CodeType[] = Platform.OS === 'ios' ? DEFAULT_BARCODE_TYPES_IOS : DEFAULT_BARCODE_TYPES_ANDROID;

import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

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


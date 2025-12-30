import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CodeType } from 'react-native-vision-camera';
import { SUPPORTED_BARCODE_TYPES } from '@/constants/constants';

const SETTINGS_STORAGE_KEY = '@barcode_scanner:settings';
const ENABLED_TYPES_KEY = 'enabledTypes';

interface BarcodeSettings {
  enabledTypes: CodeType[];
}

/**
 * Service for managing barcode scanner settings
 */
export class BarcodeSettingsService {
  /**
   * Get all enabled barcode types
   */
  static async getEnabledTypes(): Promise<CodeType[]> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) {
        // Default: all types enabled
        return SUPPORTED_BARCODE_TYPES;
      }
      const settings = JSON.parse(data) as BarcodeSettings;
      return settings.enabledTypes || SUPPORTED_BARCODE_TYPES;
    } catch (error) {
      console.error('Error reading barcode settings:', error);
      // Default: all types enabled
      return SUPPORTED_BARCODE_TYPES;
    }
  }

  /**
   * Set enabled barcode types
   */
  static async setEnabledTypes(types: CodeType[]): Promise<void> {
    try {
      const settings: BarcodeSettings = {
        enabledTypes: types,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving barcode settings:', error);
      throw error;
    }
  }

  /**
   * Check if a specific barcode type is enabled
   */
  static async isTypeEnabled(type: CodeType): Promise<boolean> {
    try {
      const enabledTypes = await this.getEnabledTypes();
      return enabledTypes.includes(type);
    } catch (error) {
      console.error('Error checking if type is enabled:', error);
      return true; // Default to enabled if error
    }
  }

  /**
   * Enable a specific barcode type
   */
  static async enableType(type: CodeType): Promise<void> {
    try {
      const enabledTypes = await this.getEnabledTypes();
      if (!enabledTypes.includes(type)) {
        await this.setEnabledTypes([...enabledTypes, type]);
      }
    } catch (error) {
      console.error('Error enabling barcode type:', error);
      throw error;
    }
  }

  /**
   * Disable a specific barcode type
   */
  static async disableType(type: CodeType): Promise<void> {
    try {
      const enabledTypes = await this.getEnabledTypes();
      const filtered = enabledTypes.filter((t) => t !== type);
      await this.setEnabledTypes(filtered);
    } catch (error) {
      console.error('Error disabling barcode type:', error);
      throw error;
    }
  }

  /**
   * Enable all barcode types
   */
  static async enableAllTypes(): Promise<void> {
    try {
      await this.setEnabledTypes(SUPPORTED_BARCODE_TYPES);
    } catch (error) {
      console.error('Error enabling all types:', error);
      throw error;
    }
  }

  /**
   * Disable all barcode types
   */
  static async disableAllTypes(): Promise<void> {
    try {
      await this.setEnabledTypes([]);
    } catch (error) {
      console.error('Error disabling all types:', error);
      throw error;
    }
  }
}


import type { BarcodeData } from '@/types/barcode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = '@barcode_scanner:history';
const MAX_HISTORY_ITEMS = 1000; // Limit history to prevent storage issues

/**
 * Service for managing barcode scan history
 */
export class BarcodeHistoryService {
  /**
   * Save a scanned barcode to history
   */
  static async saveBarcode(barcode: Omit<BarcodeData, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newBarcode: BarcodeData = {
        ...barcode,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Add to beginning of array (most recent first)
      const updatedHistory = [newBarcode, ...history];

      // Limit history size
      const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving barcode to history:', error);
      throw error;
    }
  }

  /**
   * Get all barcode history
   */
  static async getHistory(): Promise<BarcodeData[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as BarcodeData[];
    } catch (error) {
      console.error('Error reading barcode history:', error);
      return [];
    }
  }

  /**
   * Clear all barcode history
   */
  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing barcode history:', error);
      throw error;
    }
  }

  /**
   * Delete a specific barcode from history
   */
  static async deleteBarcode(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error deleting barcode from history:', error);
      throw error;
    }
  }

  /**
   * Get history count
   */
  static async getHistoryCount(): Promise<number> {
    try {
      const history = await this.getHistory();
      return history.length;
    } catch (error) {
      console.error('Error getting history count:', error);
      return 0;
    }
  }
}


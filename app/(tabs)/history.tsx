import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BarcodeHistoryService } from '@/services/barcode-history';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BarcodeData } from '@/types/barcode';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<BarcodeData[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BarcodeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await BarcodeHistoryService.getHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = history.filter(
        (item) =>
          item.value.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query),
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await BarcodeHistoryService.deleteBarcode(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadHistory();
      } catch (error) {
        console.error('Error deleting barcode:', error);
        Alert.alert('Error', 'Failed to delete barcode');
      }
    },
    [loadHistory],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await BarcodeHistoryService.clearHistory();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadHistory();
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ],
    );
  }, [loadHistory]);

  const handleCopy = useCallback(async (value: string) => {
    try {
      Clipboard.setString(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied!', 'Code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: BarcodeData }) => (
      <View
        style={[
          styles.historyItem,
          {
            backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
            borderColor: isDark ? '#333333' : '#E0E0E0',
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderLeft}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: item.isValid
                    ? `${tintColor}20`
                    : `${'#FF3B30'}20`,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.typeText,
                  {
                    color: item.isValid ? tintColor : '#FF3B30',
                  },
                ]}
              >
                {item.type.toUpperCase()}
              </ThemedText>
            </View>
            {!item.isValid && (
              <View style={styles.errorBadge}>
                <Ionicons name="warning" size={14} color="#FF3B30" />
                <ThemedText style={styles.errorBadgeText}>Invalid</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.timestampText}>{formatDate(item.timestamp)}</ThemedText>
        </View>
        <ThemedText style={styles.valueText} selectable>
          {item.value}
        </ThemedText>
        {item.error && (
          <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
            {item.error}
          </ThemedText>
        )}
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: tintColor }]}
            onPress={() => handleCopy(item.value)}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={18} color={tintColor} />
            <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
              Copy
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <ThemedText style={[styles.actionButtonText, { color: '#FF3B30' }]}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [isDark, tintColor, handleCopy, handleDelete],
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          },
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          Scan History
        </ThemedText>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={isDark ? '#999' : '#666'}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: isDark ? '#FFFFFF' : '#000000',
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
              },
            ]}
            placeholder="Search history..."
            placeholderTextColor={isDark ? '#999' : '#666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Ionicons name="close-circle" size={20} color={isDark ? '#999' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
        {history.length > 0 && (
          <TouchableOpacity
            style={[styles.clearAllButton, { borderColor: '#FF3B30' }]}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <ThemedText style={[styles.clearAllText, { color: '#FF3B30' }]}>
              Clear All
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={searchQuery ? "search-outline" : "time-outline"}
            size={64}
            color={isDark ? '#666' : '#999'}
          />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'No results found' : 'No scan history yet'}
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start scanning barcodes to see them here'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 16,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF3B3020',
  },
  errorBadgeText: {
    fontSize: 10,
    color: '#FF3B30',
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 12,
    opacity: 0.6,
  },
  valueText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});


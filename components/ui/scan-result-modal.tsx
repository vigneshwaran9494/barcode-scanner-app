import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import React, { memo, useEffect } from 'react';
import {
    Alert,
    Animated,
    Clipboard,
    Dimensions,
    Linking,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import type { Code } from 'react-native-vision-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScanResultModalProps {
  visible: boolean;
  code: Code | null;
  onClose: () => void;
}

const ScanResultModalComponent = ({
  visible,
  code,
  onClose,
}: ScanResultModalProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleCopy = async () => {
    if (!code?.value) return;
    
    try {
      Clipboard.setString(code.value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copied!', 'Code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleOpenUrl = async () => {
    if (!code?.value) return;
    
    const url = code.value.startsWith('http://') || code.value.startsWith('https://')
      ? code.value
      : `https://${code.value}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Invalid URL', 'This code does not contain a valid URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const isUrl = code?.value
    ? code.value.startsWith('http://') ||
      code.value.startsWith('https://') ||
      code.value.includes('.')
    : false;

  if (!code) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ThemedView
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#333333' : '#E0E0E0',
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${tintColor}20` },
                  ]}
                >
                  <ThemedText style={styles.iconText}>✓</ThemedText>
                </View>
                <ThemedText type="title" style={styles.title}>
                  Code Scanned!
                </ThemedText>
                <ThemedText style={styles.typeText}>
                  Type: {code.type?.toUpperCase() || 'UNKNOWN'}
                </ThemedText>
              </View>

              {/* Content */}
              <View
                style={[
                  styles.contentContainer,
                  {
                    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                    borderColor: isDark ? '#333333' : '#E0E0E0',
                  },
                ]}
              >
                <ThemedText style={styles.valueText} selectable>
                  {code.value}
                </ThemedText>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tintColor }]}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.actionButtonText}>Copy</ThemedText>
                </TouchableOpacity>

                {isUrl && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.secondaryButton,
                      { borderColor: tintColor },
                    ]}
                    onPress={handleOpenUrl}
                    activeOpacity={0.8}
                  >
                    <ThemedText
                      style={[styles.secondaryButtonText, { color: tintColor }]}
                    >
                      Open URL
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.closeButton,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0',
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={[
                      styles.closeButtonText,
                      { color: isDark ? '#FFFFFF' : '#000000' },
                    ]}
                  >
                    Close
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export const ScanResultModal = memo(ScanResultModalComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  typeText: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


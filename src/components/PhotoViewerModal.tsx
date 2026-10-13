import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { theme } from '../utils/theme';

interface PhotoViewerModalProps {
  visible: boolean;
  uri: string | null;
  title?: string | null;
  date?: string | null;
  type?: string;
  onClose: () => void;
  onDelete?: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  visible,
  uri,
  title,
  date,
  type,
  onClose,
  onDelete,
}) => {
  if (!uri) return null;

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not supported on this platform.');
      }
    } catch (e) {
      console.warn('Share error:', e);
      Alert.alert('Error', 'Unable to share media.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Action Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Feather name="share-2" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
                <Feather name="trash-2" size={20} color="#FF4B4B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Media display */}
        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </View>

        {/* Bottom Details Bar */}
        <View style={styles.bottomBar}>
          {type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{type.toUpperCase()}</Text>
            </View>
          )}
          {title && <Text style={styles.titleText}>{title}</Text>}
          {date && (
            <Text style={styles.dateText}>
              {new Date(date + 'T12:00:00Z').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? 30 : theme.spacing.md,
    paddingBottom: theme.spacing.md,
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { UnifiedTimelineItem, deleteTimelineEvent } from '../database/timelineEvents';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface TimelineItemDetailModalProps {
  item: UnifiedTimelineItem | null;
  visible: boolean;
  onClose: () => void;
  onItemDeleted?: (id: string) => void;
}

export const TimelineItemDetailModal: React.FC<TimelineItemDetailModalProps> = ({
  item,
  visible,
  onClose,
  onItemDeleted,
}) => {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!item) return null;

  const handleDelete = async () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to remove this item from your timeline?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTimelineEvent(db, item.id);
              onItemDeleted?.(item.id);
              onClose();
            } catch (e) {
              console.error('Failed to delete event:', e);
              Alert.alert('Error', 'Failed to delete event.');
            }
          },
        },
      ]
    );
  };

  const handleOpenMemoryDetail = () => {
    onClose();
    navigation.navigate('MemoryDetail', { memoryId: item.id });
  };

  const getTypeIcon = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case 'memory':
        return 'heart';
      case 'photo':
        return 'camera';
      case 'note':
        return 'file-text';
      case 'milestone':
        return 'flag';
      case 'event':
      default:
        return 'calendar';
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: item.color || theme.colors.primary }]}>
              <Feather name={getTypeIcon(item.type)} size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Date & Duration stats */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={14} color={theme.colors.text.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>{item.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="clock" size={14} color={theme.colors.text.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>
                  {item.durationHours >= 24
                    ? `${Math.round(item.durationHours / 24)} Day(s)`
                    : `${item.durationHours} Hour(s)`}
                </Text>
              </View>
            </View>

            {/* Photo preview if available */}
            {item.photoUri && (
              <View style={styles.photoContainer}>
                <Image source={{ uri: item.photoUri }} style={styles.photo} resizeMode="cover" />
              </View>
            )}

            {/* Notes */}
            {item.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            {item.isMemory ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleOpenMemoryDetail}
                activeOpacity={0.8}
              >
                <Feather name="external-link" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionBtnText}>View Full Memory</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={16} color={theme.colors.error} style={{ marginRight: 8 }} />
                <Text style={styles.deleteBtnText}>Delete Event</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
    marginBottom: 10,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  photoContainer: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  notesBox: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
  },
  deleteBtnText: {
    color: theme.colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});

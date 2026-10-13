import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { theme } from '../utils/theme';
import {
  TimelineEvent,
  TimelineItemType,
  getTypeColor,
  insertTimelineEvent
} from '../database/timelineEvents';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventAdded: (event: TimelineEvent) => void;
  initialDate?: string; // YYYY-MM-DD
}

const TYPE_OPTIONS: { type: TimelineItemType; label: string; icon: keyof typeof Feather.glyphMap; color: string }[] = [
  { type: 'event', label: 'Event', icon: 'calendar', color: '#00B894' },
  { type: 'memory', label: 'Memory', icon: 'heart', color: '#6C5CE7' },
  { type: 'photo', label: 'Photo', icon: 'camera', color: '#0984E3' },
  { type: 'note', label: 'Note', icon: 'file-text', color: '#F39C12' },
  { type: 'milestone', label: 'Milestone', icon: 'flag', color: '#E17055' },
];

const DURATION_PRESETS = [
  { label: '1 hr', value: 1 },
  { label: '2 hrs', value: 2 },
  { label: '4 hrs', value: 4 },
  { label: '6 hrs', value: 6 },
  { label: '8 hrs', value: 8 },
  { label: '1 Day', value: 24 },
  { label: '2 Days', value: 48 },
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onEventAdded,
  initialDate,
}) => {
  const db = useSQLiteContext();
  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<TimelineItemType>('event');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || todayStr);
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(initialDate || todayStr);
      setTitle('');
      setNotes('');
      setPhotoUri(null);
      setType('event');
      setDurationHours(2);
    }
  }, [visible, initialDate]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please provide a title for your memory or event.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent: TimelineEvent = {
        id: Crypto.randomUUID(),
        title: title.trim(),
        type,
        date: date.trim() || todayStr,
        duration_hours: durationHours,
        notes: notes.trim() || null,
        photo_uri: photoUri,
        color: getTypeColor(type),
        created_at: new Date().toISOString(),
      };

      await insertTimelineEvent(db, newEvent);
      onEventAdded(newEvent);
      onClose();
    } catch (error) {
      console.error('Failed to create timeline event:', error);
      Alert.alert('Error', 'Could not save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add to Timeline</Text>
              <Text style={styles.headerSubtitle}>Capture events, memories & milestones</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Type selector */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
              {TYPE_OPTIONS.map((item) => {
                const isSelected = type === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    onPress={() => setType(item.type)}
                    style={[
                      styles.typeChip,
                      isSelected && { backgroundColor: item.color, borderColor: item.color }
                    ]}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={item.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : theme.colors.text.secondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        isSelected && { color: '#FFFFFF', fontWeight: '700' }
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Title field */}
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sunset at the Bay, Team Offsite, Milestone Goal"
              placeholderTextColor={theme.colors.text.secondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Date field */}
            <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.text.secondary}
                value={date}
                onChangeText={setDate}
              />
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => setDate(todayStr)}
                activeOpacity={0.7}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>

            {/* Duration Selector */}
            <Text style={styles.fieldLabel}>DURATION (HOURS / SPAN)</Text>
            <View style={styles.durationRow}>
              {DURATION_PRESETS.map((preset) => {
                const isSelected = durationHours === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.durationChip,
                      isSelected && styles.durationChipActive
                    ]}
                    onPress={() => setDurationHours(preset.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        isSelected && styles.durationChipTextActive
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Photo Attachment (Optional) */}
            <Text style={styles.fieldLabel}>ATTACH PHOTO (OPTIONAL)</Text>
            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <Feather name="trash-2" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoPickerButton}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Feather name="image" size={18} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.photoPickerText}>Choose photo from library</Text>
              </TouchableOpacity>
            )}

            {/* Notes field */}
            <Text style={styles.fieldLabel}>NOTES & DETAILS</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add key highlights, thoughts, or details..."
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : 'Add Event to Timeline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  typeScrollView: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginRight: 8,
  },
  typeChipText: {
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  todayButton: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  durationChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  durationChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  durationChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  photoPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  photoPickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  photoPreviewWrapper: {
    position: 'relative',
    height: 140,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  saveButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});

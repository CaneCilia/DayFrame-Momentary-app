import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { UserProfile } from '../services/profileService';

interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onSave,
  onClose,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);

  useEffect(() => {
    if (visible) {
      setDisplayName(profile.displayName);
      setUsername(profile.username);
      setBio(profile.bio);
    }
  }, [visible, profile]);

  const handleSave = () => {
    onSave({
      displayName: displayName.trim() || 'DayFrame Creator',
      username: username.trim().replace(/^@/, '') || 'dayframe_user',
      bio: bio.trim(),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Feather name="x" size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your Name"
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.handleInputWrap}>
                    <Text style={styles.handlePrefix}>@</Text>
                    <TextInput
                      style={[styles.input, styles.handleInput]}
                      value={username}
                      onChangeText={(text) => setUsername(text.replace(/^@/, ''))}
                      placeholder="username"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Bio / Journal Motto</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Capture everyday light..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    multiline
                    numberOfLines={3}
                    maxLength={140}
                  />
                  <Text style={styles.charCount}>{bio.length}/140</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.saveBtn]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 28, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 440,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xs,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  handleInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xs,
    paddingHorizontal: 12,
  },
  handlePrefix: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 2,
    fontWeight: '500',
  },
  handleInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.borderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
});

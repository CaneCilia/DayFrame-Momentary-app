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
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { ConnectedServiceAccount, ServiceId } from '../services/connectedServices';

interface ConnectServiceModalProps {
  visible: boolean;
  service: ConnectedServiceAccount | null;
  onConnect: (id: ServiceId, data: Partial<ConnectedServiceAccount>) => void;
  onDisconnect: (id: ServiceId) => void;
  onClose: () => void;
}

export const ConnectServiceModal: React.FC<ConnectServiceModalProps> = ({
  visible,
  service,
  onConnect,
  onDisconnect,
  onClose,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [autoBackup, setAutoBackup] = useState(false);
  const [boardName, setBoardName] = useState('DayFrame Daily Journal');

  useEffect(() => {
    if (service && visible) {
      setIdentifier(service.accountIdentifier || '');
      setAutoBackup(!!service.autoBackup);
      setBoardName(service.extraConfig?.board || 'DayFrame Daily Journal');
    }
  }, [service, visible]);

  if (!service) return null;

  const isCloud = service.category === 'cloud';
  const isPinterest = service.id === 'pinterest';

  const handleSave = () => {
    const finalIdentifier = identifier.trim() || (isCloud ? 'user@domain.com' : 'username');
    onConnect(service.id, {
      isConnected: true,
      accountIdentifier: finalIdentifier,
      autoBackup: isCloud ? autoBackup : undefined,
      lastSynced: new Date().toISOString(),
      extraConfig: isPinterest ? { board: boardName.trim() || 'DayFrame Daily Journal' } : undefined,
    });
    onClose();
  };

  const handleDisconnect = () => {
    onDisconnect(service.id);
    onClose();
  };

  const getServiceIcon = (id: ServiceId): keyof typeof Feather.glyphMap => {
    switch (id) {
      case 'google_drive':
        return 'hard-drive';
      case 'onedrive':
        return 'cloud';
      case 'instagram':
        return 'instagram';
      case 'snapchat':
        return 'camera';
      case 'pinterest':
        return 'bookmark';
      default:
        return 'link';
    }
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
                <View style={styles.titleRow}>
                  <View style={styles.iconCircle}>
                    <Feather name={getServiceIcon(service.id)} size={18} color={theme.colors.accent} />
                  </View>
                  <View>
                    <Text style={styles.title}>
                      {service.isConnected ? `Manage ${service.name}` : `Connect ${service.name}`}
                    </Text>
                    <Text style={styles.subtitle}>
                      {isCloud ? 'Cloud Storage Archive' : 'Social Channel Sharing'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Feather name="x" size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Form Body */}
              <View style={styles.body}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    {isCloud ? 'Account Email Address' : 'Account Handle / Username'}
                  </Text>
                  <View style={styles.inputWrap}>
                    {!isCloud && <Text style={styles.prefix}>@</Text>}
                    <TextInput
                      style={[styles.input, !isCloud && styles.inputWithPrefix]}
                      value={identifier}
                      onChangeText={(val) => setIdentifier(!isCloud ? val.replace(/^@/, '') : val)}
                      placeholder={isCloud ? 'youremail@example.com' : 'username'}
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType={isCloud ? 'email-address' : 'default'}
                    />
                  </View>
                </View>

                {isPinterest && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Target Pinterest Board</Text>
                    <TextInput
                      style={styles.input}
                      value={boardName}
                      onChangeText={setBoardName}
                      placeholder="Board Name"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                )}

                {isCloud && (
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleInfo}>
                      <Text style={styles.toggleTitle}>Automatic Memory Backup</Text>
                      <Text style={styles.toggleDescription}>
                        Automatically copy captured daily moments to {service.name} in the background.
                      </Text>
                    </View>
                    <Switch
                      value={autoBackup}
                      onValueChange={setAutoBackup}
                      trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
                      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                    />
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {service.isConnected ? (
                  <>
                    <TouchableOpacity
                      style={[styles.btn, styles.disconnectBtn]}
                      onPress={handleDisconnect}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.disconnectText}>Disconnect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.saveBtn]}
                      onPress={handleSave}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.saveText}>Update Settings</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
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
                      <Text style={styles.saveText}>Connect Account</Text>
                    </TouchableOpacity>
                  </>
                )}
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
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: theme.spacing.md,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xs,
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 2,
    fontWeight: '500',
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
  inputWithPrefix: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  toggleDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
  disconnectBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  disconnectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
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

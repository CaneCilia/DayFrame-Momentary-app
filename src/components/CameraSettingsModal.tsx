import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export interface CameraSettingsState {
  showGrid: boolean;
  timerDuration: number; // 0, 3, 5, 10
  mirrorFrontCamera: boolean;
  highQuality: boolean;
}

interface CameraSettingsModalProps {
  visible: boolean;
  settings: CameraSettingsState;
  onUpdateSettings: (newSettings: Partial<CameraSettingsState>) => void;
  onClose: () => void;
}

const TIMER_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
];

export const CameraSettingsModal: React.FC<CameraSettingsModalProps> = ({
  visible,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.contentCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Camera Settings</Text>
              <Text style={styles.headerSubtitle}>Capture preferences & overlays</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Setting Rows */}
          <View style={styles.settingsList}>
            {/* Rule of Thirds Grid */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <View style={styles.settingTitleRow}>
                  <Feather name="grid" size={16} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.settingTitle}>Rule of Thirds Grid</Text>
                </View>
                <Text style={styles.settingDesc}>Display grid lines to compose balanced shots</Text>
              </View>
              <Switch
                value={settings.showGrid}
                onValueChange={(val) => onUpdateSettings({ showGrid: val })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>

            {/* Timer Options */}
            <View style={styles.settingBlock}>
              <View style={styles.settingTitleRow}>
                <Feather name="clock" size={16} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
                <Text style={styles.settingTitle}>Self Timer</Text>
              </View>
              <Text style={styles.settingDesc}>Delay capture after pressing the shutter</Text>
              <View style={styles.timerPillsRow}>
                {TIMER_OPTIONS.map((opt) => {
                  const isSelected = settings.timerDuration === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.timerPill, isSelected && styles.timerPillActive]}
                      onPress={() => onUpdateSettings({ timerDuration: opt.value })}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timerPillText, isSelected && styles.timerPillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Mirror Front Camera */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <View style={styles.settingTitleRow}>
                  <Feather name="repeat" size={16} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.settingTitle}>Mirror Front Camera</Text>
                </View>
                <Text style={styles.settingDesc}>Capture selfies as seen in preview</Text>
              </View>
              <Switch
                value={settings.mirrorFrontCamera}
                onValueChange={(val) => onUpdateSettings({ mirrorFrontCamera: val })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>

            {/* High Quality Storage */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <View style={styles.settingTitleRow}>
                  <Feather name="hard-drive" size={16} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.settingTitle}>High Quality Capture</Text>
                </View>
                <Text style={styles.settingDesc}>Preserve full sensor fidelity for memories</Text>
              </View>
              <Switch
                value={settings.highQuality}
                onValueChange={(val) => onUpdateSettings({ highQuality: val })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>
          </View>

          {/* Close CTA */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  contentCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsList: {
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  settingDesc: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  },
  settingBlock: {
    paddingVertical: 4,
  },
  timerPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  timerPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
  },
  timerPillActive: {
    backgroundColor: theme.colors.primary,
  },
  timerPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  timerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

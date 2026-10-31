import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSQLiteContext } from 'expo-sqlite';
import { restoreFromCloud } from '../services/restore';
import { theme } from '../utils/theme';
import { SyncIndicator } from '../components/SyncIndicator';
import { Feather } from '@expo/vector-icons';
import { GoogleDriveService } from '../services/GoogleDriveService';
import { OneDriveService } from '../services/OneDriveService';
import { ConnectedServices, ConnectedServiceAccount, ServiceId } from '../services/connectedServices';
import { ProfileService, UserProfile } from '../services/profileService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user } = useAuth();
  const db = useSQLiteContext();

  const [isRestoring, setIsRestoring] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Record<ServiceId, ConnectedServiceAccount> | null>(null);

  // Camera & Capture Preferences
  const [prefGrid, setPrefGrid] = useState(false);
  const [prefHighQuality, setPrefHighQuality] = useState(true);
  const [prefMirrorFront, setPrefMirrorFront] = useState(false);
  const [prefTimer, setPrefTimer] = useState<number>(0);

  // App Lock & Notifications Preferences
  const [prefAppLock, setPrefAppLock] = useState(false);
  const [prefStreakAlert, setPrefStreakAlert] = useState(true);

  // Load preferences from SQLite / AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [userProfile, connectedList] = await Promise.all([
          ProfileService.getProfile(db),
          ConnectedServices.getAll(db),
        ]);
        setProfile(userProfile);
        setServices(connectedList);

        // Load camera defaults
        const gridVal = await AsyncStorage.getItem('@df_pref_grid');
        if (gridVal !== null) setPrefGrid(gridVal === 'true');

        const hqVal = await AsyncStorage.getItem('@df_pref_hq');
        if (hqVal !== null) setPrefHighQuality(hqVal === 'true');

        const mirrorVal = await AsyncStorage.getItem('@df_pref_mirror');
        if (mirrorVal !== null) setPrefMirrorFront(mirrorVal === 'true');

        const timerVal = await AsyncStorage.getItem('@df_pref_timer');
        if (timerVal !== null) setPrefTimer(parseInt(timerVal, 10));

        const lockVal = await AsyncStorage.getItem('@df_pref_lock');
        if (lockVal !== null) setPrefAppLock(lockVal === 'true');
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }
    };

    loadSettings();
  }, [db]);

  const handleToggleGrid = async (val: boolean) => {
    setPrefGrid(val);
    await AsyncStorage.setItem('@df_pref_grid', String(val));
  };

  const handleToggleHQ = async (val: boolean) => {
    setPrefHighQuality(val);
    await AsyncStorage.setItem('@df_pref_hq', String(val));
  };

  const handleToggleMirror = async (val: boolean) => {
    setPrefMirrorFront(val);
    await AsyncStorage.setItem('@df_pref_mirror', String(val));
  };

  const handleCycleTimer = async () => {
    const nextTimer = prefTimer === 0 ? 3 : prefTimer === 3 ? 10 : 0;
    setPrefTimer(nextTimer);
    await AsyncStorage.setItem('@df_pref_timer', String(nextTimer));
  };

  const handleToggleAppLock = async (val: boolean) => {
    setPrefAppLock(val);
    await AsyncStorage.setItem('@df_pref_lock', String(val));
    Alert.alert('App Lock', val ? 'Biometric / Passcode lock enabled for DayFrame.' : 'App Lock disabled.');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Signed out', 'You have been signed out successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    try {
      setIsRestoring(true);
      await restoreFromCloud(db, user.id);
      Alert.alert('Success', 'Restored memories from the cloud successfully!');
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleToggleDriveAutoBackup = async (val: boolean) => {
    try {
      const updated = await ConnectedServices.toggleAutoBackup(db, 'google_drive', val);
      setServices((prev) => (prev ? { ...prev, google_drive: updated } : null));
    } catch (err: any) {
      Alert.alert('Error', 'Could not update Google Drive settings.');
    }
  };

  const handleToggleOneDriveAutoBackup = async (val: boolean) => {
    try {
      const updated = await ConnectedServices.toggleAutoBackup(db, 'onedrive', val);
      setServices((prev) => (prev ? { ...prev, onedrive: updated } : null));
    } catch (err: any) {
      Alert.alert('Error', 'Could not update OneDrive settings.');
    }
  };

  const isDriveConnected = !!services?.google_drive?.isConnected;
  const isOneDriveConnected = !!services?.onedrive?.isConnected;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Go back">
          <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Gateway Card */}
        <TouchableOpacity
          style={styles.profileGateCard}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <View style={styles.profileGateLeft}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {profile?.displayName ? profile.displayName[0].toUpperCase() : 'D'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileGateName}>{profile?.displayName || 'DayFrame Creator'}</Text>
              <Text style={styles.profileGateHandle}>
                @{profile?.username || 'user'} · View Profile Space
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        {/* 1. Account & Identity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account & Cloud Identity</Text>
            {user && <SyncIndicator />}
          </View>
          {user ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Logged In Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.restoreButton, isRestoring && styles.disabledButton]}
                onPress={handleRestore}
                disabled={isRestoring}
                activeOpacity={0.85}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Restore Memories from Cloud</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={handleSignOut}
                disabled={isRestoring}
                activeOpacity={0.7}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.placeholder}>
                Sign in with Supabase to enable real-time cloud synchronization across your devices.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Auth')}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>Sign In or Create Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 2. Cloud Storage Archives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cloud Storage Archives</Text>
          </View>
          <Text style={styles.placeholder}>
            Configure automated background replication to personal cloud storage.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Google Drive Mirror</Text>
              <Text style={styles.rowSubtitle}>
                {isDriveConnected ? services?.google_drive?.accountIdentifier : 'Not linked'}
              </Text>
            </View>
            {isDriveConnected ? (
              <Switch
                value={!!services?.google_drive?.autoBackup}
                onValueChange={handleToggleDriveAutoBackup}
                trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.inlineLinkBtn}
              >
                <Text style={styles.inlineLinkText}>Setup</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Microsoft OneDrive Mirror</Text>
              <Text style={styles.rowSubtitle}>
                {isOneDriveConnected ? services?.onedrive?.accountIdentifier : 'Not linked'}
              </Text>
            </View>
            {isOneDriveConnected ? (
              <Switch
                value={!!services?.onedrive?.autoBackup}
                onValueChange={handleToggleOneDriveAutoBackup}
                trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
              />
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={styles.inlineLinkBtn}
              >
                <Text style={styles.inlineLinkText}>Setup</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. Camera & Capture Defaults */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Camera & Capture Defaults</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Rule of Thirds Grid</Text>
              <Text style={styles.rowSubtitle}>Display 3x3 alignment guidelines in viewfinder</Text>
            </View>
            <Switch
              value={prefGrid}
              onValueChange={handleToggleGrid}
              trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>High Fidelity Photography</Text>
              <Text style={styles.rowSubtitle}>Uncompressed 100% JPEG quality</Text>
            </View>
            <Switch
              value={prefHighQuality}
              onValueChange={handleToggleHQ}
              trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Mirror Front Selfies</Text>
              <Text style={styles.rowSubtitle}>Match front camera preview orientation</Text>
            </View>
            <Switch
              value={prefMirrorFront}
              onValueChange={handleToggleMirror}
              trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
            />
          </View>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={handleCycleTimer} activeOpacity={0.7}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Default Shutter Timer</Text>
              <Text style={styles.rowSubtitle}>Delay before capture</Text>
            </View>
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>{prefTimer === 0 ? 'Off' : `${prefTimer}s`}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Notifications & Daily Ritual */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications & Daily Ritual</Text>
          </View>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('ReminderSetup')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.rowTitle}>Daily Capture Reminder</Text>
              <Text style={styles.rowSubtitle}>Custom prompt time for your daily photo</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Streak Danger Warning</Text>
              <Text style={styles.rowSubtitle}>Alert if today's frame is unrecorded by 9 PM</Text>
            </View>
            <Switch
              value={prefStreakAlert}
              onValueChange={setPrefStreakAlert}
              trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
            />
          </View>
        </View>

        {/* 5. Archive & Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Archive, Cache & Privacy</Text>
          </View>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Storage')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.rowTitle}>Storage & Media Cache</Text>
              <Text style={styles.rowSubtitle}>View photo footprint and clear thumbnails</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Privacy')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.rowTitle}>Privacy & Data Protection</Text>
              <Text style={styles.rowSubtitle}>Local-first architecture and encryption</Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.rowTitle}>Biometric App Lock</Text>
              <Text style={styles.rowSubtitle}>Require FaceID or fingerprint to open DayFrame</Text>
            </View>
            <Switch
              value={prefAppLock}
              onValueChange={handleToggleAppLock}
              trackColor={{ false: theme.colors.surface.secondary, true: theme.colors.accent }}
            />
          </View>
        </View>

        {/* 6. About */}
        <View style={styles.aboutFooter}>
          <Text style={styles.aboutBrand}>DayFrame — Momentary</Text>
          <Text style={styles.aboutVersion}>Version 1.2.0 (Build 57) · Local-First Architecture</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  profileGateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: theme.spacing.md,
  },
  profileGateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  profileGateName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  profileGateHandle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.xs,
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signOutText: {
    color: theme.colors.text.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  settingRowLeft: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  inlineLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inlineLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  valueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  aboutFooter: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  aboutBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  aboutVersion: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 3,
  },
});

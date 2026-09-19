import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSQLiteContext } from 'expo-sqlite';
import { restoreFromCloud } from '../services/restore';
import { theme } from '../utils/theme';
import { SyncIndicator } from '../components/SyncIndicator';

import { GoogleDriveService } from '../services/GoogleDriveService';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user } = useAuth();
  const db = useSQLiteContext();
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isDriveConnected, setIsDriveConnected] = React.useState(false);

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

  const handleConnectDrive = async () => {
    try {
      if (isDriveConnected) {
        await GoogleDriveService.signOut();
        setIsDriveConnected(false);
        Alert.alert('Google Drive', 'Disconnected successfully.');
      } else {
        const userInfo = await GoogleDriveService.signIn();
        setIsDriveConnected(true);
        Alert.alert('Google Drive', `Connected as ${userInfo.user.email}. Future memories will be backed up.`);
      }
    } catch (error: any) {
      Alert.alert('Google Drive Error', error.message || 'Failed to connect to Google Drive.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          {user && <SyncIndicator />}
        </View>
        {user ? (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, styles.restoreButton, isRestoring && styles.disabledButton]} 
              onPress={handleRestore}
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{isRestoring ? 'Restoring...' : 'Restore from Cloud'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.signOutButton]} 
              onPress={handleSignOut} 
              disabled={isRestoring}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: theme.colors.accent }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.placeholder}>Enable secure cloud backup to sync your timeline across devices.</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Google Drive Backup</Text>
        </View>
        <Text style={styles.placeholder}>Securely back up your encrypted vault to your personal Google Drive.</Text>
        <TouchableOpacity 
          style={[styles.button, isDriveConnected && styles.signOutButton]} 
          onPress={handleConnectDrive}
          activeOpacity={0.8}
        >
          <Text style={isDriveConnected ? [styles.buttonText, { color: theme.colors.accent }] : styles.buttonText}>
            {isDriveConnected ? 'Disconnect Google Drive' : 'Connect Google Drive'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App & Data</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuRow}
          onPress={() => navigation.navigate('Storage')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuRowText}>Storage & Data</Text>
          <Text style={styles.menuRowArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuRow, { borderBottomWidth: 0 }]}
          onPress={() => navigation.navigate('Privacy')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuRowText}>Privacy Hub</Text>
          <Text style={styles.menuRowArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  section: { 
    marginBottom: 30, 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.card, 
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  placeholder: { 
    fontSize: 16, 
    color: theme.colors.text.secondary, 
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  button: { 
    backgroundColor: theme.colors.primary, 
    paddingVertical: theme.spacing.md, 
    borderRadius: theme.borderRadius.pill, 
    alignItems: 'center',
  },
  restoreButton: { 
    backgroundColor: '#007AFF', 
    marginBottom: theme.spacing.md,
  },
  signOutButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  buttonText: { color: theme.colors.text.inverse, fontSize: 16, fontWeight: '600' },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuRowText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  menuRowArrow: {
    fontSize: 20,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  }
});

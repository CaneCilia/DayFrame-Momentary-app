import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
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
        if (userInfo && userInfo.type === 'success') {
          setIsDriveConnected(true);
          Alert.alert('Google Drive', `Connected as ${userInfo.data.user.email}. Future memories will be backed up.`);
        }
      }
    } catch (error: any) {
      Alert.alert('Google Drive Error', error.message || 'Failed to connect to Google Drive.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Storage, cloud synchronization & privacy</Text>
          </View>
        </View>
        
        {/* Cloud Sync */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cloud Synchronization</Text>
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
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{isRestoring ? 'Restoring...' : 'Restore from Cloud'}</Text>
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
              <Text style={styles.placeholder}>Enable secure cloud backup to sync your daily diary across devices.</Text>
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

        {/* Google Drive */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Google Drive Archive</Text>
          </View>
          <Text style={styles.placeholder}>Directly preserve your daily photography archive in your personal Google Drive storage.</Text>
          <TouchableOpacity 
            style={[styles.button, isDriveConnected ? styles.signOutButton : null]} 
            onPress={handleConnectDrive}
            activeOpacity={0.85}
          >
            <Text style={isDriveConnected ? styles.signOutText : styles.buttonText}>
              {isDriveConnected ? 'Disconnect Google Drive' : 'Connect Google Drive'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App & Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Archive & Privacy</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuRow}
            onPress={() => navigation.navigate('Storage')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuRowText}>Storage & Media Cache</Text>
            <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Privacy')}
            activeOpacity={0.7}
          >
            <Text style={styles.menuRowText}>Privacy & Data Protection</Text>
            <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
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
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: -8,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '600', 
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  section: { 
    marginBottom: theme.spacing.lg, 
    padding: theme.spacing.md, 
    backgroundColor: theme.colors.card, 
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
    fontSize: 13, 
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
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  menuRowText: {
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
});

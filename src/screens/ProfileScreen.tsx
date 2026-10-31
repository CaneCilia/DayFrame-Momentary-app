import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import {
  ProfileService,
  UserProfile,
  ProfileStats,
} from '../services/profileService';
import {
  ConnectedServices,
  ConnectedServiceAccount,
  ServiceId,
} from '../services/connectedServices';
import { EditProfileModal } from '../components/EditProfileModal';
import { ConnectServiceModal } from '../components/ConnectServiceModal';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const isFocused = useIsFocused();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: 'DayFrame Creator',
    username: 'dayframe_user',
    bio: 'Preserving everyday light and quiet moments.',
    avatarUri: null,
    joinDate: 'October 2026',
    membershipTier: 'DayFrame Member',
  });
  const [stats, setStats] = useState<ProfileStats>({
    totalMemories: 0,
    currentStreak: 0,
    favoriteCount: 0,
    storageMb: 0,
    storageFormatted: '0 MB',
  });
  const [services, setServices] = useState<Record<ServiceId, ConnectedServiceAccount> | null>(null);

  // Modals state
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ConnectedServiceAccount | null>(null);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [userProfile, profileStats, connectedAccounts] = await Promise.all([
        ProfileService.getProfile(db),
        ProfileService.getProfileStats(db),
        ConnectedServices.getAll(db),
      ]);
      setProfile(userProfile);
      setStats(profileStats);
      setServices(connectedAccounts);
    } catch (e) {
      console.error('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  // Avatar picker handler
  const handlePickAvatar = async () => {
    try {
      const uri = await ProfileService.pickAvatar(db);
      if (uri) {
        setProfile((prev) => ({ ...prev, avatarUri: uri }));
      }
    } catch (err: any) {
      Alert.alert('Avatar Picker', err.message || 'Could not select photo');
    }
  };

  // Profile save handler
  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    try {
      const newProfile = await ProfileService.updateProfile(db, updated);
      setProfile(newProfile);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  // Service modal openers
  const handleOpenServiceModal = (serviceId: ServiceId) => {
    if (services && services[serviceId]) {
      setSelectedService(services[serviceId]);
      setIsServiceModalVisible(true);
    }
  };

  // Service connection handler
  const handleConnectService = async (id: ServiceId, data: Partial<ConnectedServiceAccount>) => {
    try {
      const updated = await ConnectedServices.updateService(db, id, data);
      setServices((prev) => (prev ? { ...prev, [id]: updated } : null));
      Alert.alert(
        `${updated.name} Connected`,
        `Successfully linked ${updated.accountIdentifier || 'account'}.`
      );
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message || 'Could not link service.');
    }
  };

  // Service disconnect handler
  const handleDisconnectService = async (id: ServiceId) => {
    try {
      const disconnected = await ConnectedServices.disconnect(db, id);
      setServices((prev) => (prev ? { ...prev, [id]: disconnected } : null));
      Alert.alert('Disconnected', `${disconnected.name} has been unlinked.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not disconnect service.');
    }
  };

  // Share profile telemetry card
  const handleShareProfile = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        const textToShare = `DayFrame Journal Profile\nCreator: ${profile.displayName} (@${profile.username})\nMemories Logged: ${stats.totalMemories}\nCurrent Streak: ${stats.currentStreak} Days\n\nPreserve one photo every day with DayFrame.`;
        // In Expo, string text can be copied or shared
        Alert.alert('Profile Card', textToShare, [
          { text: 'Close', style: 'cancel' },
        ]);
      }
    } catch (e: any) {
      console.warn('Share error:', e);
    }
  };

  const renderServiceCard = (id: ServiceId, iconName: keyof typeof Feather.glyphMap) => {
    if (!services || !services[id]) return null;
    const item = services[id];
    const isCloud = item.category === 'cloud';

    return (
      <View key={id} style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceMeta}>
            <View style={[styles.serviceIconWrap, item.isConnected && styles.serviceIconWrapActive]}>
              <Feather
                name={iconName}
                size={18}
                color={item.isConnected ? theme.colors.accent : theme.colors.text.secondary}
              />
            </View>
            <View>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceDetail}>
                {item.isConnected
                  ? item.accountIdentifier || 'Connected'
                  : isCloud
                  ? 'Auto-archive photos'
                  : 'Story & feed export'}
              </Text>
            </View>
          </View>

          <View style={styles.serviceRight}>
            <View
              style={[
                styles.badge,
                item.isConnected ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  item.isConnected ? styles.badgeDotActive : styles.badgeDotInactive,
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  item.isConnected ? styles.badgeTextActive : styles.badgeTextInactive,
                ]}
              >
                {item.isConnected ? 'Active' : 'Not Linked'}
              </Text>
            </View>
          </View>
        </View>

        {item.isConnected && isCloud && item.autoBackup && (
          <View style={styles.serviceSubInfo}>
            <Feather name="check" size={12} color={theme.colors.success} />
            <Text style={styles.serviceSubInfoText}>Automatic background backup enabled</Text>
          </View>
        )}

        <View style={styles.serviceFooter}>
          <TouchableOpacity
            style={[styles.serviceBtn, item.isConnected && styles.serviceBtnManage]}
            onPress={() => handleOpenServiceModal(id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.serviceBtnText, item.isConnected && styles.serviceBtnTextManage]}>
              {item.isConnected ? 'Manage Setup' : `Connect ${item.name}`}
            </Text>
            <Feather
              name={item.isConnected ? 'sliders' : 'plus'}
              size={13}
              color={item.isConnected ? theme.colors.text.primary : theme.colors.text.inverse}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const userInitials = profile.displayName
    ? profile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DF';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBtn}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Profile Space</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.navBtn}
          accessibilityLabel="Open settings"
        >
          <Feather name="settings" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Space */}
          <View style={styles.identityCard}>
            <View style={styles.avatarWrap}>
              <TouchableOpacity
                onPress={handlePickAvatar}
                style={styles.avatarTouch}
                activeOpacity={0.85}
              >
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{userInitials}</Text>
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <Feather name="camera" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>

            <View style={styles.tierPill}>
              <Feather name="shield" size={11} color={theme.colors.accent} />
              <Text style={styles.tierText}>{profile.membershipTier}</Text>
            </View>

            {profile.bio ? (
              <Text style={styles.bioText}>"{profile.bio}"</Text>
            ) : null}

            <View style={styles.identityActions}>
              <TouchableOpacity
                style={[styles.idBtn, styles.editBtn]}
                onPress={() => setIsEditModalVisible(true)}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={13} color={theme.colors.text.primary} />
                <Text style={styles.idBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.idBtn, styles.shareBtn]}
                onPress={handleShareProfile}
                activeOpacity={0.7}
              >
                <Feather name="share-2" size={13} color={theme.colors.text.primary} />
                <Text style={styles.idBtnText}>Share Stats</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Journal Telemetry Stats Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Journal Telemetry</Text>
            <Text style={styles.sectionSubtitle}>Daily photo cadence & local vault footprint</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="image" size={14} color={theme.colors.accent} />
              </View>
              <Text style={styles.statValue}>{stats.totalMemories}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="zap" size={14} color="#EA580C" />
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}d</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="heart" size={14} color="#E11D48" />
              </View>
              <Text style={styles.statValue}>{stats.favoriteCount}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Feather name="hard-drive" size={14} color={theme.colors.text.secondary} />
              </View>
              <Text style={styles.statValue}>{stats.storageFormatted}</Text>
              <Text style={styles.statLabel}>Vault</Text>
            </View>
          </View>

          {/* Cloud Storage Archives */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cloud Storage Archives</Text>
            <Text style={styles.sectionSubtitle}>
              Independent personal cloud mirrors for high-res retention
            </Text>
          </View>

          {renderServiceCard('google_drive', 'hard-drive')}
          {renderServiceCard('onedrive', 'cloud')}

          {/* Social & Sharing Channels */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social & Sharing Channels</Text>
            <Text style={styles.sectionSubtitle}>
              Link accounts to export Polaroid moments to stories & boards
            </Text>
          </View>

          {renderServiceCard('instagram', 'instagram')}
          {renderServiceCard('snapchat', 'camera')}
          {renderServiceCard('pinterest', 'bookmark')}

          {/* Quick Settings Gateway Card */}
          <TouchableOpacity
            style={styles.settingsGateCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <View style={styles.gateLeft}>
              <View style={styles.gateIconWrap}>
                <Feather name="sliders" size={18} color={theme.colors.accent} />
              </View>
              <View>
                <Text style={styles.gateTitle}>System Settings & Preferences</Text>
                <Text style={styles.gateSubtitle}>Camera defaults, reminders, cache & privacy</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modals */}
      <EditProfileModal
        visible={isEditModalVisible}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsEditModalVisible(false)}
      />

      <ConnectServiceModal
        visible={isServiceModalVisible}
        service={selectedService}
        onConnect={handleConnectService}
        onDisconnect={handleDisconnectService}
        onClose={() => setIsServiceModalVisible(false)}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xs,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  identityCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  avatarWrap: {
    marginBottom: theme.spacing.sm,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surface.subtle,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text.inverse,
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  displayName: {
    fontSize: 19,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.pill,
    marginTop: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.accentInk,
  },
  bioText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    paddingHorizontal: theme.spacing.sm,
  },
  identityActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.md,
    width: '100%',
  },
  idBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface.subtle,
  },
  editBtn: {},
  shareBtn: {},
  idBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  serviceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconWrapActive: {
    backgroundColor: theme.colors.accentSoft,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  serviceDetail: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  serviceRight: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.pill,
  },
  badgeActive: {
    backgroundColor: 'rgba(22, 101, 52, 0.08)',
  },
  badgeInactive: {
    backgroundColor: theme.colors.surface.subtle,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeDotActive: {
    backgroundColor: theme.colors.success,
  },
  badgeDotInactive: {
    backgroundColor: theme.colors.text.tertiary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: theme.colors.success,
  },
  badgeTextInactive: {
    color: theme.colors.text.tertiary,
  },
  serviceSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  serviceSubInfoText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
  serviceFooter: {
    marginTop: 12,
  },
  serviceBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xs,
  },
  serviceBtnManage: {
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  serviceBtnTextManage: {
    color: theme.colors.text.primary,
  },
  settingsGateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginTop: theme.spacing.sm,
  },
  gateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  gateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  gateSubtitle: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

import { SQLiteDatabase } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentStreak, getAllMemories, getFavoriteMemories } from '../database/memories';

export interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarUri: string | null;
  joinDate: string;
  membershipTier: string;
}

export interface ProfileStats {
  totalMemories: number;
  currentStreak: number;
  favoriteCount: number;
  storageMb: number;
  storageFormatted: string;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'DayFrame Creator',
  username: 'dayframe_user',
  bio: 'Preserving everyday light and quiet moments.',
  avatarUri: null,
  joinDate: 'October 2026',
  membershipTier: 'DayFrame Member',
};

const PROFILE_STORAGE_KEY = '@dayframe_user_profile_v1';

export class ProfileService {
  /**
   * Fetches the user profile from SQLite or AsyncStorage fallback.
   */
  static async getProfile(db?: SQLiteDatabase | null): Promise<UserProfile> {
    try {
      if (db) {
        const row = await db.getFirstAsync<{ value: string }>(
          `SELECT value FROM settings WHERE key = 'user_profile'`
        );
        if (row?.value) {
          return { ...DEFAULT_PROFILE, ...JSON.parse(row.value) };
        }
      }

      const cached = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Failed to load user profile:', e);
    }

    return DEFAULT_PROFILE;
  }

  /**
   * Saves updated profile fields to SQLite and AsyncStorage.
   */
  static async updateProfile(
    db: SQLiteDatabase | null | undefined,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const current = await this.getProfile(db);
    const updated: UserProfile = {
      ...current,
      ...updates,
    };

    try {
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO settings (key, value) VALUES ('user_profile', ?)`,
          [JSON.stringify(updated)]
        );
      }
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }

    return updated;
  }

  /**
   * Launches native image library to pick a custom profile avatar.
   */
  static async pickAvatar(db?: SQLiteDatabase | null): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access photos was denied.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        await this.updateProfile(db, { avatarUri: selectedUri });
        return selectedUri;
      }
    } catch (e: any) {
      console.error('Failed to pick avatar:', e);
      throw e;
    }
    return null;
  }

  /**
   * Computes dynamic profile telemetry statistics from the local SQLite database.
   */
  static async getProfileStats(db: SQLiteDatabase): Promise<ProfileStats> {
    try {
      const [allMemories, streak, favorites] = await Promise.all([
        getAllMemories(db),
        getCurrentStreak(db),
        getFavoriteMemories(db),
      ]);

      const totalMemories = allMemories.length;
      const favoriteCount = favorites.length;
      
      // Approximate storage: average ~2.2 MB per memory original + thumbnail
      const totalMb = Math.round(totalMemories * 2.2 * 10) / 10;
      const storageFormatted = totalMb >= 1000 
        ? `${(totalMb / 1024).toFixed(1)} GB` 
        : `${totalMb} MB`;

      return {
        totalMemories,
        currentStreak: streak,
        favoriteCount,
        storageMb: totalMb,
        storageFormatted,
      };
    } catch (e) {
      console.error('Failed to compute profile stats:', e);
      return {
        totalMemories: 0,
        currentStreak: 0,
        favoriteCount: 0,
        storageMb: 0,
        storageFormatted: '0 MB',
      };
    }
  }
}

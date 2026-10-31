import { SQLiteDatabase } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ServiceId = 'google_drive' | 'onedrive' | 'instagram' | 'snapchat' | 'pinterest';

export type ServiceCategory = 'cloud' | 'social';

export interface ConnectedServiceAccount {
  id: ServiceId;
  name: string;
  category: ServiceCategory;
  isConnected: boolean;
  accountIdentifier?: string; // e.g. email or @username
  lastSynced?: string;
  autoBackup?: boolean;
  extraConfig?: Record<string, any>;
}

export const INITIAL_SERVICES: Record<ServiceId, ConnectedServiceAccount> = {
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'cloud',
    isConnected: false,
    accountIdentifier: '',
    autoBackup: false,
  },
  onedrive: {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    category: 'cloud',
    isConnected: false,
    accountIdentifier: '',
    autoBackup: false,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    isConnected: false,
    accountIdentifier: '',
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'social',
    isConnected: false,
    accountIdentifier: '',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'social',
    isConnected: false,
    accountIdentifier: '',
    extraConfig: { board: 'DayFrame Daily Journal' },
  },
};

const STORAGE_KEY = '@dayframe_connected_services_v1';

/**
 * Service to manage connected cloud storage archives and social platforms.
 * Uses SQLite `settings` table as primary and AsyncStorage as backup.
 */
export class ConnectedServices {
  /**
   * Retrieves all services with their current connection status.
   */
  static async getAll(db?: SQLiteDatabase | null): Promise<Record<ServiceId, ConnectedServiceAccount>> {
    try {
      if (db) {
        const rows = await db.getAllAsync<{ key: string; value: string }>(
          `SELECT key, value FROM settings WHERE key LIKE 'service_%'`
        );
        if (rows && rows.length > 0) {
          const result = { ...INITIAL_SERVICES };
          for (const row of rows) {
            try {
              const serviceId = row.key.replace('service_', '') as ServiceId;
              if (result[serviceId]) {
                const parsed = JSON.parse(row.value);
                result[serviceId] = { ...result[serviceId], ...parsed };
              }
            } catch (err) {
              console.warn(`Failed to parse settings row for ${row.key}:`, err);
            }
          }
          return result;
        }
      }

      // Fallback to AsyncStorage
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        return { ...INITIAL_SERVICES, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.error('Error fetching connected services:', e);
    }

    return { ...INITIAL_SERVICES };
  }

  /**
   * Updates or connects a specific service account.
   */
  static async updateService(
    db: SQLiteDatabase | null | undefined,
    id: ServiceId,
    updates: Partial<ConnectedServiceAccount>
  ): Promise<ConnectedServiceAccount> {
    const current = await this.getAll(db);
    const updated: ConnectedServiceAccount = {
      ...current[id],
      ...updates,
      id,
    };

    current[id] = updated;

    try {
      // Save to SQLite
      if (db) {
        await db.runAsync(
          `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
          [`service_${id}`, JSON.stringify(updated)]
        );
      }
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
    }

    return updated;
  }

  /**
   * Disconnects a specific service and clears its credentials.
   */
  static async disconnect(
    db: SQLiteDatabase | null | undefined,
    id: ServiceId
  ): Promise<ConnectedServiceAccount> {
    return this.updateService(db, id, {
      isConnected: false,
      accountIdentifier: '',
      autoBackup: false,
    });
  }

  /**
   * Toggles the auto-backup setting for cloud services.
   */
  static async toggleAutoBackup(
    db: SQLiteDatabase | null | undefined,
    id: 'google_drive' | 'onedrive',
    enabled: boolean
  ): Promise<ConnectedServiceAccount> {
    return this.updateService(db, id, {
      autoBackup: enabled,
    });
  }
}

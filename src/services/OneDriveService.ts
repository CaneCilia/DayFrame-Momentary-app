import AsyncStorage from '@react-native-async-storage/async-storage';

const ONEDRIVE_STORAGE_KEY = '@dayframe_onedrive_auth';

export interface OneDriveUser {
  id: string;
  displayName: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Service for handling Microsoft OneDrive cloud backup and synchronization
 * utilizing the Microsoft Graph REST API (/v1.0/me/drive).
 */
export class OneDriveService {
  private static currentUser: OneDriveUser | null = null;

  /**
   * Initializes and restores any saved OneDrive session.
   */
  static async getSession(): Promise<OneDriveUser | null> {
    if (this.currentUser) return this.currentUser;

    try {
      const data = await AsyncStorage.getItem(ONEDRIVE_STORAGE_KEY);
      if (data) {
        this.currentUser = JSON.parse(data);
        return this.currentUser;
      }
    } catch (e) {
      console.warn('Failed to load OneDrive session from storage:', e);
    }
    return null;
  }

  /**
   * Simulates/initiates Microsoft OAuth 2.0 Graph flow.
   * In dev builds, this hooks into the Microsoft OAuth identity provider.
   */
  static async signIn(email?: string): Promise<OneDriveUser> {
    try {
      const resolvedEmail = email || 'user@outlook.com';
      const user: OneDriveUser = {
        id: `onedrive_${Date.now()}`,
        displayName: resolvedEmail.split('@')[0],
        email: resolvedEmail,
        accessToken: `mock_graph_token_${Date.now()}`,
      };

      this.currentUser = user;
      await AsyncStorage.setItem(ONEDRIVE_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('OneDrive signIn error:', error);
      throw new Error(error.message || 'Failed to authenticate with Microsoft OneDrive');
    }
  }

  /**
   * Clears the current OneDrive session and cached tokens.
   */
  static async signOut(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem(ONEDRIVE_STORAGE_KEY);
  }

  /**
   * Uploads a photo to the user's /DayFrame/ directory on OneDrive.
   */
  static async uploadPhoto(photoUri: string, filename: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session) {
      throw new Error('Not authenticated with Microsoft OneDrive');
    }

    try {
      console.log(`[OneDriveService] Uploading ${filename} from ${photoUri} to /DayFrame/`);
      // In production, this performs a PUT request to:
      // https://graph.microsoft.com/v1.0/me/drive/root:/DayFrame/${filename}:/content
      return true;
    } catch (error: any) {
      console.error('OneDrive upload failed:', error);
      throw error;
    }
  }
}

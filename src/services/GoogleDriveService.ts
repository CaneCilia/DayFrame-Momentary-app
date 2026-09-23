let GoogleSignin: any;
let statusCodes: any;

try {
  const RNGoogleSignin = require('@react-native-google-signin/google-signin');
  GoogleSignin = RNGoogleSignin.GoogleSignin;
  statusCodes = RNGoogleSignin.statusCodes;
} catch (e) {
  console.warn("Google Signin native module is not available. This is expected in Expo Go. Please use a Dev Build.");
  GoogleSignin = {
    configure: () => {},
    hasPlayServices: async () => false,
    signIn: async () => { throw new Error("Google Sign In requires a Dev Build."); },
    getTokens: async () => ({ accessToken: null }),
    signOut: async () => {},
  };
  statusCodes = {};
}

/**
 * Service for handling true native Google Drive backup and sync.
 * This utilizes @react-native-google-signin/google-signin for authentication
 * and accesses the Google Drive API directly using standard REST requests.
 */
export class GoogleDriveService {
  /**
   * Configure Google Sign-In with your web client ID (and optionally iOS client ID).
   */
  static configure() {
    GoogleSignin.configure({
      scopes: [
        'https://www.googleapis.com/auth/drive.appdata', // Scope for App Data folder
        'https://www.googleapis.com/auth/drive.file'    // Scope for files created by the app
      ],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true, 
      forceCodeForRefreshToken: true,
    });
  }

  /**
   * Prompt user to sign in to Google.
   */
  static async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return userInfo;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('Some other error happened:', error);
      }
      throw error;
    }
  }

  /**
   * Obtain the current access token for Google API requests.
   */
  static async getTokens() {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens;
    } catch (error) {
      console.error('Failed to get tokens', error);
      throw error;
    }
  }

  /**
   * Gets or creates a "DayFrame" folder in the user's Google Drive.
   */
  private static async getOrCreateFolder(accessToken: string): Promise<string> {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name='DayFrame' and trashed=false");
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'DayFrame',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    const createData = await createRes.json();
    return createData.id;
  }

  /**
   * Upload a file to Google Drive.
   * Uses standard REST fetch request since Google API Node client isn't React Native compatible natively.
   */
  static async uploadFile(fileUri: string, metadata: any) {
    const tokens = await this.getTokens();
    if (!tokens.accessToken) {
      throw new Error('No access token available');
    }

    const folderId = await this.getOrCreateFolder(tokens.accessToken);
    console.log(`Starting upload to folder ${folderId} for ${fileUri}`);

    const fileMetadata = {
      name: metadata.fileName || `DayFrame-${Date.now()}.jpg`,
      parents: [folderId],
      description: metadata.caption || 'A DayFrame memory',
    };

    // Step 1: Create the empty file with metadata
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileMetadata),
    });
    
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create drive file: ${err}`);
    }
    
    const createData = await createRes.json();
    const fileId = createData.id;

    // Step 2: Upload content using Expo FileSystem (avoids RN FormData Blob bugs)
    const FileSystem = await import('expo-file-system/legacy');
    const uploadRes = await FileSystem.uploadAsync(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      fileUri,
      {
        httpMethod: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'image/jpeg',
        },
      }
    );

    if (uploadRes.status !== 200) {
      throw new Error(`Google Drive media upload failed: ${uploadRes.body}`);
    }

    return JSON.parse(uploadRes.body);
  }

  /**
   * Sign out and clear tokens.
   */
  static async signOut() {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  }
}

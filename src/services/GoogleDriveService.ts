import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

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
      // webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Required for obtaining an access token
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
   * Placeholder: Upload a file to Google Drive.
   * Uses standard REST fetch request since Google API Node client isn't React Native compatible natively.
   */
  static async uploadFile(fileUri: string, metadata: any) {
    const tokens = await this.getTokens();
    if (!tokens.accessToken) {
      throw new Error('No access token available');
    }

    // TODO: Implement multipart fetch request to https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart
    // including the file binary data and the JSON metadata.
    console.log(`Starting upload for ${fileUri} with metadata`, metadata);
    
    // Simulating upload delay
    return new Promise((resolve) => setTimeout(resolve, 1000));
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

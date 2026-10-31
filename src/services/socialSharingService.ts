import { Linking, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export interface SocialShareResult {
  success: boolean;
  channel: 'instagram' | 'snapchat' | 'pinterest' | 'native';
  error?: string;
}

/**
 * Service to handle expressive exports to Instagram, Snapchat, and Pinterest,
 * supporting deep linking, app presence detection, and graceful fallbacks.
 */
export class SocialSharingService {
  /**
   * Checks if an external social app is installed via custom URL schemes.
   */
  static async isAppInstalled(platform: 'instagram' | 'snapchat' | 'pinterest'): Promise<boolean> {
    try {
      const schemeMap: Record<string, string> = {
        instagram: 'instagram://app',
        snapchat: 'snapchat://',
        pinterest: 'pinit://',
      };
      const scheme = schemeMap[platform];
      return await Linking.canOpenURL(scheme);
    } catch {
      return false;
    }
  }

  /**
   * Share memory to Instagram Stories or Feed.
   */
  static async shareToInstagram(photoUri: string): Promise<SocialShareResult> {
    try {
      const isInstalled = await this.isAppInstalled('instagram');
      if (isInstalled && Platform.OS === 'ios') {
        const canOpenStory = await Linking.canOpenURL('instagram-stories://share');
        if (canOpenStory) {
          await Linking.openURL('instagram-stories://share');
          return { success: true, channel: 'instagram' };
        }
      }

      // Fallback to Native Share Sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(photoUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share to Instagram',
        });
        return { success: true, channel: 'instagram' };
      }

      return { success: false, channel: 'instagram', error: 'Sharing not available on this device' };
    } catch (error: any) {
      console.error('Error sharing to Instagram:', error);
      return { success: false, channel: 'instagram', error: error.message };
    }
  }

  /**
   * Share memory to Snapchat camera / stories.
   */
  static async shareToSnapchat(photoUri: string): Promise<SocialShareResult> {
    try {
      const isInstalled = await this.isAppInstalled('snapchat');
      if (isInstalled) {
        const snapScheme = 'snapchat://creativekit/preview';
        const canOpen = await Linking.canOpenURL(snapScheme);
        if (canOpen) {
          await Linking.openURL(snapScheme);
          return { success: true, channel: 'snapchat' };
        }
      }

      // Fallback to Native Share Sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(photoUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share to Snapchat',
        });
        return { success: true, channel: 'snapchat' };
      }

      return { success: false, channel: 'snapchat', error: 'Sharing not available' };
    } catch (error: any) {
      console.error('Error sharing to Snapchat:', error);
      return { success: false, channel: 'snapchat', error: error.message };
    }
  }

  /**
   * Pin memory to a user's Pinterest board.
   */
  static async shareToPinterest(
    photoUri: string,
    description: string = 'Captured with DayFrame',
    board?: string
  ): Promise<SocialShareResult> {
    try {
      const isInstalled = await this.isAppInstalled('pinterest');
      if (isInstalled) {
        const pinitUrl = `pinit://pin/create/?description=${encodeURIComponent(description)}`;
        const canOpen = await Linking.canOpenURL(pinitUrl);
        if (canOpen) {
          await Linking.openURL(pinitUrl);
          return { success: true, channel: 'pinterest' };
        }
      }

      // Fallback to Native Share Sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(photoUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Pin to Pinterest${board ? ` (${board})` : ''}`,
        });
        return { success: true, channel: 'pinterest' };
      }

      return { success: false, channel: 'pinterest', error: 'Sharing not available' };
    } catch (error: any) {
      console.error('Error sharing to Pinterest:', error);
      return { success: false, channel: 'pinterest', error: error.message };
    }
  }
}

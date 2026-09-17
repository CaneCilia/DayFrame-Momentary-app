import * as FileSystem from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite';
import { supabase } from '../lib/supabase';
import { getMemoryById, insertMemory } from '../database/memories';
import * as Crypto from 'expo-crypto';

export const restoreFromCloud = async (db: SQLiteDatabase, userId: string) => {
  try {
    // 1. Fetch all memory metadata for this user from Supabase
    const { data: cloudMemories, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (!cloudMemories || cloudMemories.length === 0) {
      console.log('No memories to restore from cloud.');
      return;
    }

    console.log(`Found ${cloudMemories.length} memories in the cloud. Checking local...`);

    // 2. Iterate and restore missing memories
    for (const cloudMemory of cloudMemories) {
      const localMemory = await getMemoryById(db, cloudMemory.id);
      
      // If we already have it locally, skip
      if (localMemory) {
        continue;
      }

      console.log(`Restoring memory from ${cloudMemory.date}...`);

      // 3. Get signed URL for the image
      const storagePath = cloudMemory.photo_path;
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('memories')
        .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

      if (signedUrlError || !signedUrlData) {
        console.error(`Failed to get signed URL for memory ${cloudMemory.id}:`, signedUrlError);
        continue;
      }

      // 4. Download directly to local filesystem
      const localFilename = `memory_${cloudMemory.date}_${Crypto.randomUUID()}.jpg`;
      const localUri = `${FileSystem.documentDirectory}photos/${localFilename}`;
      
      // Ensure photos directory exists
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}photos/`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos/`, { intermediates: true });
      }

      const { uri, status } = await FileSystem.downloadAsync(signedUrlData.signedUrl, localUri);
      
      if (status !== 200) {
        console.error(`Failed to download image from signed URL for memory ${cloudMemory.id}`);
        continue;
      }

      // 5. Save to local SQLite database
      await insertMemory(db, {
        id: cloudMemory.id,
        date: cloudMemory.date,
        photoUri: uri,
        caption: cloudMemory.caption,
        sync_status: 'SYNCED', // Already synced since it came from the cloud
      });
    }

    console.log('Cloud restore complete.');
  } catch (error) {
    console.error('Failed to restore from cloud:', error);
    throw error;
  }
};

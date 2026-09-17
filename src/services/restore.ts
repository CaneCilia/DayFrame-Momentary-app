import { Paths, Directory, File } from 'expo-file-system';
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

    // Ensure photos directory exists
    const APP_DIR = new Directory(Paths.document, 'DayFrame');
    if (!APP_DIR.exists) APP_DIR.create();
    
    const PHOTOS_DIR = new Directory(APP_DIR, 'photos');
    if (!PHOTOS_DIR.exists) PHOTOS_DIR.create();

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
      const destFile = new File(PHOTOS_DIR, localFilename);

      try {
        await File.downloadFileAsync(signedUrlData.signedUrl, destFile);
      } catch (err) {
        console.error(`Failed to download image for memory ${cloudMemory.id}:`, err);
        continue;
      }

      // 5. Save to local SQLite database
      await insertMemory(db, {
        id: cloudMemory.id,
        date: cloudMemory.date,
        photoUri: destFile.uri,
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

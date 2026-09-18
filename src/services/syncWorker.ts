import * as Network from 'expo-network';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SQLite from 'expo-sqlite';
import { File } from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { getPendingSyncOperations, updateSyncOperationStatus, deleteSyncOperation } from '../database/syncQueue';
import { getMemoryById } from '../database/memories';

export const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

// Helper to upload to Supabase Storage
const uploadPhotoToSupabase = async (userId: string, photoUri: string, filename: string) => {
  const file = new File(photoUri);
  if (!file.exists) throw new Error('File does not exist locally');

  const arrayBuffer = await file.arrayBuffer();

  const filePath = `${userId}/${filename}`;
  const { data, error } = await supabase.storage
    .from('memories')
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;
  return data.path;
};

// Process the sync queue
export const processSyncQueue = async (db: SQLite.SQLiteDatabase) => {
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    console.log('No internet connection. Skipping sync.');
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.log('User not authenticated. Skipping sync.');
    return;
  }

  const pendingOps = await getPendingSyncOperations(db);
  if (pendingOps.length === 0) {
    return;
  }

  console.log(`Found ${pendingOps.length} pending operations.`);

  for (const op of pendingOps) {
    try {
      if (op.operation === 'UPLOAD_PHOTO' && op.entity_type === 'MEMORY') {
        const memory = await getMemoryById(db, op.entity_id);
        if (!memory) {
          // If memory is deleted locally, just remove the operation
          await deleteSyncOperation(db, op.id);
          continue;
        }

        // Upload photo
        const filename = `memory_${memory.date}.jpg`;
        const storagePath = await uploadPhotoToSupabase(session.user.id, memory.photoUri, filename);

        // Upload metadata
        const { error: dbError } = await supabase
          .from('memories')
          .upsert({
            id: memory.id,
            user_id: session.user.id,
            date: memory.date,
            photo_path: storagePath,
            caption: memory.caption,
            created_at: new Date().toISOString(),
          });

        if (dbError) throw dbError;

        // Mark local memory as synced
        await db.runAsync('UPDATE memories SET sync_status = ? WHERE id = ?', ['SYNCED', memory.id]);
        
        // Optional: Backup to Google Drive
        import('./driveBackup').then(async ({ backupToGoogleDrive }) => {
           const backupResult = await backupToGoogleDrive(memory.photoUri, memory.date);
           if (backupResult.success) {
               console.log(`Successfully backed up memory ${memory.date} to Drive`);
           }
        }).catch(err => console.error("Drive backup integration failed to load", err));

        // Remove from queue
        await deleteSyncOperation(db, op.id);
        console.log(`Successfully synced memory ${memory.date}`);
      }
    } catch (error) {
      console.error(`Failed to process operation ${op.id}:`, error);
      // Mark as failed so it can be retried later
      await updateSyncOperationStatus(db, op.id, 'FAILED');
    }
  }
};

// You must use a stable SQLite connection inside the background task since context isn't available
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const db = await SQLite.openDatabaseAsync('dayframe.db');
    await processSyncQueue(db);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only
    startOnBoot: true, // android only
  });
}

export async function unregisterBackgroundSync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
}

import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface SyncOperation {
  id: string;
  operation: 'UPLOAD_PHOTO' | 'UPDATE_METADATA' | 'DELETE_MEMORY';
  entity_id: string;
  entity_type: 'MEMORY';
  payload: string | null;
  status: 'PENDING' | 'FAILED' | 'SYNCED';
  created_at: string;
}

/**
 * Inserts a new operation into the sync queue.
 * @param db SQLiteDatabase instance
 * @param operation Type of operation
 * @param entity_id The ID of the related entity (e.g. memory ID)
 * @param entity_type Type of the entity
 * @param payload Optional JSON payload for the operation
 */
export const enqueueSyncOperation = async (
  db: SQLiteDatabase,
  operation: SyncOperation['operation'],
  entity_id: string,
  entity_type: SyncOperation['entity_type'],
  payload: any = null
): Promise<void> => {
  const id = Crypto.randomUUID();
  const created_at = new Date().toISOString();
  const payloadStr = payload ? JSON.stringify(payload) : null;

  await db.runAsync(
    'INSERT INTO sync_queue (id, operation, entity_id, entity_type, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, operation, entity_id, entity_type, payloadStr, 'PENDING', created_at]
  );
};

/**
 * Fetches all pending operations from the sync queue.
 * @param db SQLiteDatabase instance
 */
export const getPendingSyncOperations = async (db: SQLiteDatabase): Promise<SyncOperation[]> => {
  const result = await db.getAllAsync<SyncOperation>(
    "SELECT * FROM sync_queue WHERE status = 'PENDING' OR status = 'FAILED' ORDER BY created_at ASC"
  );
  return result;
};

/**
 * Updates the status of a sync queue operation.
 */
export const updateSyncOperationStatus = async (
  db: SQLiteDatabase,
  id: string,
  status: SyncOperation['status']
): Promise<void> => {
  await db.runAsync(
    'UPDATE sync_queue SET status = ? WHERE id = ?',
    [status, id]
  );
};

/**
 * Removes completed or unneeded operations from the queue.
 */
export const deleteSyncOperation = async (db: SQLiteDatabase, id: string): Promise<void> => {
  await db.runAsync(
    'DELETE FROM sync_queue WHERE id = ?',
    [id]
  );
};

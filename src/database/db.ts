import { type SQLiteDatabase } from 'expo-sqlite';

/**
 * Initializes the SQLite database and creates necessary tables.
 */
export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Memories table to store the daily photos
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL UNIQUE,
      photoUri TEXT NOT NULL,
      caption TEXT,
      sync_status TEXT DEFAULT 'PENDING'
    );

    -- Sync Queue for offline-first cloud sync
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      operation TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      payload TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );

    -- User information table
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      name TEXT,
      last_sync TEXT
    );

    -- App settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
}

import { type SQLiteDatabase } from 'expo-sqlite';

/**
 * Initializes the SQLite database and creates necessary tables.
 */
export async function initializeDatabase(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL UNIQUE,
        photoUri TEXT NOT NULL,
        caption TEXT,
        sync_status TEXT DEFAULT 'PENDING'
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        operation TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT,
        name TEXT,
        last_sync TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );
    `);

    // Handle FTS table separately to avoid execAsync native crashes
    try {
      await db.runAsync(`DROP TRIGGER IF EXISTS memories_ai;`);
      await db.runAsync(`DROP TRIGGER IF EXISTS memories_ad;`);
      await db.runAsync(`DROP TRIGGER IF EXISTS memories_au;`);
      await db.runAsync(`DROP TABLE IF EXISTS memories_fts;`);
    } catch (e) {
      console.log('Skipping FTS drop', e);
    }

    await db.runAsync(`
      CREATE VIRTUAL TABLE memories_fts USING fts5(
        caption,
        date,
        content='memories',
        content_rowid='rowid'
      );
    `);

    await db.runAsync(`
      INSERT INTO memories_fts(rowid, caption, date) 
      SELECT rowid, caption, date FROM memories;
    `);

    await db.runAsync(`
      CREATE TRIGGER memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(rowid, caption, date) VALUES (new.rowid, new.caption, new.date);
      END;
    `);

    await db.runAsync(`
      CREATE TRIGGER memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, caption, date) VALUES('delete', old.rowid, old.caption, old.date);
      END;
    `);

    await db.runAsync(`
      CREATE TRIGGER memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, caption, date) VALUES('delete', old.rowid, old.caption, old.date);
        INSERT INTO memories_fts(rowid, caption, date) VALUES (new.rowid, new.caption, new.date);
      END;
    `);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}


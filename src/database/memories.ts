import { type SQLiteDatabase } from 'expo-sqlite';

export interface Memory {
  id: string;
  date: string; // YYYY-MM-DD
  photoUri: string;
  caption: string | null;
  sync_status: string;
}

/**
 * Fetch a memory for a specific date.
 * @param db SQLiteDatabase instance
 * @param date Date string in YYYY-MM-DD format
 * @returns The memory object if found, otherwise null
 */
export const getMemoryByDate = async (db: SQLiteDatabase, date: string): Promise<Memory | null> => {
  const result = await db.getFirstAsync<Memory>(
    'SELECT * FROM memories WHERE date = ?',
    [date]
  );
  return result || null;
};

/**
 * Insert a new memory record into the database.
 * @param db SQLiteDatabase instance
 * @param memory The memory object to insert
 */
export const insertMemory = async (db: SQLiteDatabase, memory: Memory): Promise<void> => {
  await db.runAsync(
    'INSERT INTO memories (id, date, photoUri, caption, sync_status) VALUES (?, ?, ?, ?, ?)',
    [memory.id, memory.date, memory.photoUri, memory.caption, memory.sync_status]
  );
};

/**
 * Fetch all memories ordered by date descending.
 * @param db SQLiteDatabase instance
 * @returns Array of memories
 */
export const getAllMemories = async (db: SQLiteDatabase): Promise<Memory[]> => {
  const result = await db.getAllAsync<Memory>(
    'SELECT * FROM memories ORDER BY date DESC'
  );
  return result;
};

/**
 * Fetch a specific memory by its ID.
 * @param db SQLiteDatabase instance
 * @param id The memory ID
 * @returns The memory object if found, otherwise null
 */
export const getMemoryById = async (db: SQLiteDatabase, id: string): Promise<Memory | null> => {
  const result = await db.getFirstAsync<Memory>(
    'SELECT * FROM memories WHERE id = ?',
    [id]
  );
  return result || null;
};

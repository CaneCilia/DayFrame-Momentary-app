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

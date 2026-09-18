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

/**
 * Calculate the current daily photo streak.
 * @param db SQLiteDatabase instance
 * @returns The current streak count
 */
export const getCurrentStreak = async (db: SQLiteDatabase): Promise<number> => {
  const result = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM memories ORDER BY date DESC'
  );
  
  if (result.length === 0) return 0;
  
  // Get unique dates sorted descending
  const dates = [...new Set(result.map(row => row.date))].sort().reverse();
  
  let streak = 0;
  
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - (offset * 60 * 1000));
  const todayStr = localDate.toISOString().split('T')[0];
  
  const yesterday = new Date(localDate.getTime());
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let expectedDateStr = '';
  
  if (dates[0] === todayStr) {
    expectedDateStr = todayStr;
  } else if (dates[0] === yesterdayStr) {
    expectedDateStr = yesterdayStr;
  } else {
    return 0; // Streak broken
  }
  
  const currentCheckDate = new Date(expectedDateStr + "T00:00:00Z");
  
  for (let i = 0; i < dates.length; i++) {
    const dStr = currentCheckDate.toISOString().split('T')[0];
    if (dates.includes(dStr)) {
      streak++;
      currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

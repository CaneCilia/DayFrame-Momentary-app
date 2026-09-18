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
  const allMemories = await db.getAllAsync<Memory>('SELECT * FROM memories ORDER BY date DESC');
  if (allMemories.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  // ... timezone offset logic
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - (offset * 60 * 1000));
  localToday.setUTCHours(0,0,0,0);

  let currentDate = localToday;
  let firstMemoryDate = new Date(allMemories[0].date);
  firstMemoryDate.setUTCHours(0,0,0,0);

  const diffTime = Math.abs(currentDate.getTime() - firstMemoryDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays > 1) {
    return 0; // Streak broken
  }

  for (let i = 0; i < allMemories.length; i++) {
    const memDate = new Date(allMemories[i].date);
    memDate.setUTCHours(0,0,0,0);
    
    // Check if it's exactly the expected day in the streak
    const expectedTime = currentDate.getTime() - (streak === 0 && diffDays === 1 ? (1000 * 60 * 60 * 24) : (streak * 1000 * 60 * 60 * 24));
    
    if (memDate.getTime() === expectedTime || memDate.getTime() === currentDate.getTime()) {
      // If it's today and streak is 0, we count it. 
      if (memDate.getTime() !== currentDate.getTime() || streak === 0) {
         streak++;
      }
    } else {
      break;
    }
  }

  return streak;
};

export const getOnThisDayMemories = async (db: SQLiteDatabase, monthStr: string, dayStr: string, currentYear: string): Promise<Memory[]> => {
  // SQLite doesn't have a robust date parser for YYYY-MM-DD built-in to compare parts easily without functions,
  // but we know our format is exactly YYYY-MM-DD.
  // We can use LIKE '%-MM-DD' and filter out the current year.
  const likePattern = `%-${monthStr}-${dayStr}`;
  const results = await db.getAllAsync<Memory>(
    'SELECT * FROM memories WHERE date LIKE ? AND date NOT LIKE ? ORDER BY date DESC',
    [likePattern, `${currentYear}-%`]
  );
  return results;
};

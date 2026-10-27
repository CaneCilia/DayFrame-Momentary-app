import { type SQLiteDatabase } from 'expo-sqlite';
import { getAllMemories, Memory } from './memories';
import { theme } from '../utils/theme';

export type TimelineItemType = 'photo' | 'memory' | 'event' | 'note' | 'milestone';

export interface TimelineEvent {
  id: string;
  title: string;
  type: TimelineItemType;
  date: string; // YYYY-MM-DD
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_hours: number;
  notes?: string | null;
  photo_uri?: string | null;
  color?: string | null;
  created_at: string;
}

export interface UnifiedTimelineItem {
  id: string;
  title: string;
  type: TimelineItemType;
  date: string; // YYYY-MM-DD
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationHours: number;
  notes?: string | null;
  photoUri?: string | null;
  color?: string | null;
  isMemory?: boolean;
}

/**
 * Fetch all timeline events ordered by date DESC, created_at DESC
 */
export const getAllTimelineEvents = async (db: SQLiteDatabase): Promise<TimelineEvent[]> => {
  try {
    const events = await db.getAllAsync<TimelineEvent>(
      'SELECT * FROM timeline_events ORDER BY date DESC, created_at DESC'
    );
    return events;
  } catch (error) {
    console.error('Failed to get timeline events:', error);
    return [];
  }
};

/**
 * Insert a new timeline event
 */
export const insertTimelineEvent = async (
  db: SQLiteDatabase,
  event: TimelineEvent
): Promise<void> => {
  await db.runAsync(
    `INSERT INTO timeline_events (
      id, title, type, date, end_date, start_time, end_time, duration_hours, notes, photo_uri, color, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.id,
      event.title,
      event.type,
      event.date,
      event.end_date || null,
      event.start_time || null,
      event.end_time || null,
      event.duration_hours || 1,
      event.notes || null,
      event.photo_uri || null,
      event.color || null,
      event.created_at || new Date().toISOString()
    ]
  );
};

/**
 * Delete a timeline event by ID
 */
export const deleteTimelineEvent = async (db: SQLiteDatabase, id: string): Promise<void> => {
  await db.runAsync('DELETE FROM timeline_events WHERE id = ?', [id]);
};

/**
 * Fetch events for a specific date (YYYY-MM-DD)
 */
export const getEventsByDate = async (
  db: SQLiteDatabase,
  date: string
): Promise<TimelineEvent[]> => {
  try {
    const events = await db.getAllAsync<TimelineEvent>(
      'SELECT * FROM timeline_events WHERE date = ? OR (end_date IS NOT NULL AND date <= ? AND end_date >= ?) ORDER BY created_at ASC',
      [date, date, date]
    );
    return events;
  } catch (error) {
    console.error('Failed to get events by date:', error);
    return [];
  }
};

/**
 * Color mapper helper for item types (Solid, mature, production-grade palette)
 */
export const getTypeColor = (type: TimelineItemType): string => {
  return theme.colors.itemTypes[type] || theme.colors.itemTypes.memory;
};

/**
 * Fetch unified timeline items (both captured memories & custom events/notes/milestones)
 */
export const getUnifiedTimelineItems = async (
  db: SQLiteDatabase
): Promise<UnifiedTimelineItem[]> => {
  try {
    const [memories, events] = await Promise.all([
      getAllMemories(db),
      getAllTimelineEvents(db)
    ]);

    // Map captured memories to timeline items
    const memoryItems: UnifiedTimelineItem[] = memories.map((m: Memory) => ({
      id: m.id,
      title: m.caption ? (m.caption.length > 30 ? m.caption.substring(0, 30) + '...' : m.caption) : 'Captured Memory',
      type: 'memory',
      date: m.date,
      durationHours: 2, // Default duration block for daily capture
      notes: m.caption || null,
      photoUri: m.photoUri,
      color: getTypeColor('memory'),
      isMemory: true
    }));

    // Map events
    const eventItems: UnifiedTimelineItem[] = events.map((e: TimelineEvent) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date,
      endDate: e.end_date,
      startTime: e.start_time,
      endTime: e.end_time,
      durationHours: e.duration_hours || 1,
      notes: e.notes,
      photoUri: e.photo_uri,
      color: e.color || getTypeColor(e.type),
      isMemory: false
    }));

    // Combine and sort by date descending
    const combined = [...memoryItems, ...eventItems].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.durationHours - a.durationHours;
    });

    return combined;
  } catch (error) {
    console.error('Failed to get unified timeline items:', error);
    return [];
  }
};

import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { getAllMemories, Memory } from './memories';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  thumbnail_uri: string | null;
  created_at: string;
  subfolder_count?: number;
  album_count?: number;
}

export interface Album {
  id: string;
  name: string;
  cover_photo_uri: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface AlbumItem {
  id: string;
  album_id: string;
  photo_uri: string;
  title: string | null;
  item_type: 'photo' | 'video' | 'memory';
  date: string | null;
  created_at: string;
}

export interface GalleryMediaItem {
  id: string;
  uri: string;
  title: string;
  type: 'photo' | 'video' | 'memory';
  date: string;
  is_favorite: boolean;
  album_id?: string | null;
  notes?: string | null;
}

/**
 * Fetch folders for a specific parent (or root if parent_id is null)
 */
export const getFolders = async (
  db: SQLiteDatabase,
  parentId: string | null = null
): Promise<Folder[]> => {
  try {
    let folders: Folder[];
    if (parentId) {
      folders = await db.getAllAsync<Folder>(
        'SELECT * FROM folders WHERE parent_id = ? ORDER BY name ASC',
        [parentId]
      );
    } else {
      folders = await db.getAllAsync<Folder>(
        'SELECT * FROM folders WHERE parent_id IS NULL OR parent_id = "" ORDER BY name ASC'
      );
    }

    // Attach counts
    for (const folder of folders) {
      const subfolders = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM folders WHERE parent_id = ?',
        [folder.id]
      );
      const albums = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM albums WHERE folder_id = ?',
        [folder.id]
      );
      folder.subfolder_count = subfolders?.count || 0;
      folder.album_count = albums?.count || 0;
    }

    return folders;
  } catch (error) {
    console.error('Failed to get folders:', error);
    return [];
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (
  db: SQLiteDatabase,
  name: string,
  parentId: string | null = null,
  thumbnailUri: string | null = null
): Promise<Folder> => {
  const newFolder: Folder = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    parent_id: parentId || null,
    thumbnail_uri: thumbnailUri || null,
    created_at: new Date().toISOString(),
    subfolder_count: 0,
    album_count: 0,
  };

  await db.runAsync(
    'INSERT INTO folders (id, name, parent_id, thumbnail_uri, created_at) VALUES (?, ?, ?, ?, ?)',
    [newFolder.id, newFolder.name, newFolder.parent_id, newFolder.thumbnail_uri, newFolder.created_at]
  );

  return newFolder;
};

/**
 * Rename a folder
 */
export const renameFolder = async (db: SQLiteDatabase, id: string, name: string): Promise<void> => {
  await db.runAsync('UPDATE folders SET name = ? WHERE id = ?', [name.trim(), id]);
};

/**
 * Delete a folder and unlink children
 */
export const deleteFolder = async (db: SQLiteDatabase, id: string): Promise<void> => {
  await db.runAsync('UPDATE albums SET folder_id = NULL WHERE folder_id = ?', [id]);
  await db.runAsync('UPDATE folders SET parent_id = NULL WHERE parent_id = ?', [id]);
  await db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
};

/**
 * Search across folders
 */
export const searchFolders = async (db: SQLiteDatabase, query: string): Promise<Folder[]> => {
  if (!query.trim()) return [];
  const searchPattern = `%${query.trim()}%`;
  return await db.getAllAsync<Folder>(
    'SELECT * FROM folders WHERE name LIKE ? ORDER BY name ASC',
    [searchPattern]
  );
};

/**
 * Fetch albums optionally filtered by folder and sorted by date or name
 */
export const getAlbums = async (
  db: SQLiteDatabase,
  folderId?: string | null,
  sortBy: 'date' | 'name' = 'date'
): Promise<Album[]> => {
  try {
    let query = 'SELECT * FROM albums';
    const params: any[] = [];

    if (folderId !== undefined) {
      if (folderId === null) {
        query += ' WHERE folder_id IS NULL OR folder_id = ""';
      } else {
        query += ' WHERE folder_id = ?';
        params.push(folderId);
      }
    }

    if (sortBy === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY updated_at DESC';
    }

    const albums = await db.getAllAsync<Album>(query, params);

    // Attach item count and auto cover if needed
    for (const album of albums) {
      const itemsCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM album_items WHERE album_id = ?',
        [album.id]
      );
      album.item_count = itemsCount?.count || 0;

      if (!album.cover_photo_uri) {
        const firstItem = await db.getFirstAsync<AlbumItem>(
          'SELECT photo_uri FROM album_items WHERE album_id = ? ORDER BY created_at DESC LIMIT 1',
          [album.id]
        );
        if (firstItem) {
          album.cover_photo_uri = firstItem.photo_uri;
        }
      }
    }

    return albums;
  } catch (error) {
    console.error('Failed to get albums:', error);
    return [];
  }
};

/**
 * Create a new album
 */
export const createAlbum = async (
  db: SQLiteDatabase,
  name: string,
  coverPhotoUri: string | null = null,
  folderId: string | null = null
): Promise<Album> => {
  const now = new Date().toISOString();
  const newAlbum: Album = {
    id: Crypto.randomUUID(),
    name: name.trim(),
    cover_photo_uri: coverPhotoUri || null,
    folder_id: folderId || null,
    created_at: now,
    updated_at: now,
    item_count: 0,
  };

  await db.runAsync(
    'INSERT INTO albums (id, name, cover_photo_uri, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [newAlbum.id, newAlbum.name, newAlbum.cover_photo_uri, newAlbum.folder_id, newAlbum.created_at, newAlbum.updated_at]
  );

  return newAlbum;
};

/**
 * Rename an album
 */
export const renameAlbum = async (db: SQLiteDatabase, id: string, name: string): Promise<void> => {
  const now = new Date().toISOString();
  await db.runAsync('UPDATE albums SET name = ?, updated_at = ? WHERE id = ?', [name.trim(), now, id]);
};

/**
 * Delete an album and its item associations
 */
export const deleteAlbum = async (db: SQLiteDatabase, id: string): Promise<void> => {
  await db.runAsync('DELETE FROM album_items WHERE album_id = ?', [id]);
  await db.runAsync('DELETE FROM albums WHERE id = ?', [id]);
};

/**
 * Move album to folder
 */
export const moveAlbumToFolder = async (
  db: SQLiteDatabase,
  albumId: string,
  folderId: string | null
): Promise<void> => {
  await db.runAsync('UPDATE albums SET folder_id = ? WHERE id = ?', [folderId, albumId]);
};

/**
 * Set album cover
 */
export const setAlbumCover = async (
  db: SQLiteDatabase,
  albumId: string,
  coverPhotoUri: string
): Promise<void> => {
  await db.runAsync('UPDATE albums SET cover_photo_uri = ? WHERE id = ?', [coverPhotoUri, albumId]);
};

/**
 * Fetch items in an album
 */
export const getAlbumItems = async (
  db: SQLiteDatabase,
  albumId: string,
  sortBy: 'date' | 'name' = 'date'
): Promise<AlbumItem[]> => {
  try {
    const orderClause = sortBy === 'name' ? 'ORDER BY title ASC' : 'ORDER BY date DESC, created_at DESC';
    return await db.getAllAsync<AlbumItem>(
      `SELECT * FROM album_items WHERE album_id = ? ${orderClause}`,
      [albumId]
    );
  } catch (error) {
    console.error('Failed to get album items:', error);
    return [];
  }
};

/**
 * Add a photo/item to an album
 */
export const addItemToAlbum = async (
  db: SQLiteDatabase,
  albumId: string,
  photoUri: string,
  title?: string | null,
  itemType: 'photo' | 'video' | 'memory' = 'photo',
  date?: string | null
): Promise<AlbumItem> => {
  const now = new Date().toISOString();
  const newItem: AlbumItem = {
    id: Crypto.randomUUID(),
    album_id: albumId,
    photo_uri: photoUri,
    title: title || null,
    item_type: itemType,
    date: date || now.split('T')[0],
    created_at: now,
  };

  await db.runAsync(
    'INSERT INTO album_items (id, album_id, photo_uri, title, item_type, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [newItem.id, newItem.album_id, newItem.photo_uri, newItem.title, newItem.item_type, newItem.date, newItem.created_at]
  );

  // Update album's updated_at and cover photo if missing
  await db.runAsync('UPDATE albums SET updated_at = ? WHERE id = ?', [now, albumId]);
  await db.runAsync(
    'UPDATE albums SET cover_photo_uri = ? WHERE id = ? AND (cover_photo_uri IS NULL OR cover_photo_uri = "")',
    [photoUri, albumId]
  );

  return newItem;
};

/**
 * Remove an item from an album
 */
export const removeItemFromAlbum = async (
  db: SQLiteDatabase,
  albumId: string,
  itemId: string
): Promise<void> => {
  await db.runAsync('DELETE FROM album_items WHERE id = ? AND album_id = ?', [itemId, albumId]);
};

/**
 * Unified Gallery media aggregator
 */
export const getAllGalleryMedia = async (db: SQLiteDatabase): Promise<GalleryMediaItem[]> => {
  try {
    const memories: Memory[] = await getAllMemories(db);
    const albumItems: AlbumItem[] = await db.getAllAsync<AlbumItem>('SELECT * FROM album_items');

    const mediaMap = new Map<string, GalleryMediaItem>();

    // Add memories
    memories.forEach((m) => {
      if (m.photoUri) {
        mediaMap.set(m.photoUri, {
          id: m.id,
          uri: m.photoUri,
          title: m.caption || 'Daily Memory',
          type: 'memory',
          date: m.date,
          is_favorite: m.is_favorite === 1,
          notes: m.caption,
        });
      }
    });

    // Add album items
    albumItems.forEach((ai) => {
      if (ai.photo_uri && !mediaMap.has(ai.photo_uri)) {
        mediaMap.set(ai.photo_uri, {
          id: ai.id,
          uri: ai.photo_uri,
          title: ai.title || 'Photo',
          type: ai.item_type || 'photo',
          date: ai.date || ai.created_at.split('T')[0],
          is_favorite: false,
          album_id: ai.album_id,
        });
      }
    });

    const items = Array.from(mediaMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    return items;
  } catch (error) {
    console.error('Failed to get gallery media:', error);
    return [];
  }
};

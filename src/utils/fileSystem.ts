import { Paths, Directory, File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const APP_DIR = new Directory(Paths.document, 'DayFrame');
const PHOTOS_DIR = new Directory(APP_DIR, 'photos');

/**
 * Ensure that the necessary directories exist in the app's internal storage.
 */
export const initFileSystem = async (): Promise<void> => {
  if (!APP_DIR.exists) {
    APP_DIR.create();
  }
  if (!PHOTOS_DIR.exists) {
    PHOTOS_DIR.create();
  }
};

/**
 * Save an image to the local internal storage.
 * @param sourceUri The temporary or original URI of the image.
 * @param filename The desired filename (e.g., '2023-10-25.jpg').
 * @returns The permanent local URI of the saved image.
 */
export const saveImageToLocal = async (sourceUri: string, filename: string): Promise<string> => {
  await initFileSystem();
  const destFile = new File(PHOTOS_DIR, filename);
  await new File(sourceUri).copy(destFile);
  return destFile.uri;
};

/**
 * Get the local URI for a given filename.
 * @param filename The filename to resolve.
 * @returns The full local URI.
 */
export const getLocalImageUri = (filename: string): string => {
  return new File(PHOTOS_DIR, filename).uri;
};

/**
 * Delete an image from the local internal storage.
 * @param filename The filename of the image to delete.
 */
export const deleteImageFromLocal = async (filename: string): Promise<void> => {
  const file = new File(PHOTOS_DIR, filename);
  if (file.exists) {
    file.delete();
  }
};

/**
 * Generate a thumbnail from a given image URI.
 * @param sourceUri The URI of the source image.
 * @param width The target width of the thumbnail (default: 300).
 * @returns The URI of the generated thumbnail.
 */
export const generateThumbnail = async (sourceUri: string, width: number = 300): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
};

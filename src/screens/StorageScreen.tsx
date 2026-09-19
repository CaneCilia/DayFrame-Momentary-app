import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import { theme } from '../utils/theme';

export const StorageScreen = () => {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [photoCacheSize, setPhotoCacheSize] = useState(0);
  const [dbSize, setDbSize] = useState(0);

  const calculateSizes = async () => {
    try {
      setLoading(true);
      // Calculate photos directory size
      const photosDir = `${FileSystem.documentDirectory}DayFrame/photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      
      let totalPhotoSize = 0;
      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(photosDir);
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${photosDir}${file}`);
          if (fileInfo.exists && !fileInfo.isDirectory) {
            totalPhotoSize += fileInfo.size || 0;
          }
        }
      }
      setPhotoCacheSize(totalPhotoSize);

      // In SQLite for Expo, getting DB size directly is tricky without reading the file.
      // We'll approximate or find the DB file in FileSystem.documentDirectory + 'SQLite/'
      const dbPath = `${FileSystem.documentDirectory}SQLite/dayframe.db`;
      const dbInfo = await FileSystem.getInfoAsync(dbPath);
      if (dbInfo.exists && !dbInfo.isDirectory) {
        setDbSize(dbInfo.size || 0);
      } else {
        setDbSize(0);
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSizes();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Local Cache',
      'Are you sure? This will delete local photos that have already been synced to the cloud to free up space. Unsynced photos will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Implementation detail: Delete files where sync_status === 'SYNCED'
              // For MVP, we alert that it's processing.
              const syncedMemories = await db.getAllAsync<{ photoUri: string }>("SELECT photoUri FROM memories WHERE sync_status = 'SYNCED'");
              
              let deletedCount = 0;
              for (const mem of syncedMemories) {
                const info = await FileSystem.getInfoAsync(mem.photoUri);
                if (info.exists) {
                  await FileSystem.deleteAsync(mem.photoUri);
                  deletedCount++;
                }
              }
              
              Alert.alert('Cache Cleared', `Successfully freed up space by deleting ${deletedCount} synced photos from local storage.`);
              calculateSizes();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to clear cache.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Storage & Data</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Usage</Text>
          
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={theme.colors.primary} />
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Photos Cache</Text>
                <Text style={styles.infoValue}>{formatBytes(photoCacheSize)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Database Size</Text>
                <Text style={styles.infoValue}>{formatBytes(dbSize)}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Total Used</Text>
                <Text style={[styles.infoValue, { color: theme.colors.primary, fontWeight: '700' }]}>
                  {formatBytes(photoCacheSize + dbSize)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimize Storage</Text>
          <Text style={styles.bodyText}>
            Free up device space by safely clearing your local photo cache. Only memories that are fully synced with Google Drive will be removed locally, leaving unsynced photos intact.
          </Text>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearCache}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>Clear Synced Photos</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF', // Use a standard blue or accent color
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

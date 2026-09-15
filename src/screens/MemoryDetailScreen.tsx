import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryById, Memory } from '../database/memories';
import { RootStackParamList } from '../navigation/AppNavigator';

type MemoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoryDetail'>;

export const MemoryDetailScreen = () => {
  const route = useRoute<MemoryDetailScreenRouteProp>();
  const db = useSQLiteContext();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemory = async () => {
      try {
        const mem = await getMemoryById(db, route.params.memoryId);
        setMemory(mem);
      } catch (e) {
        console.error('Failed to load memory details:', e);
      } finally {
        setLoading(false);
      }
    };
    loadMemory();
  }, [db, route.params.memoryId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading memory...</Text>
      </View>
    );
  }

  if (!memory) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Memory not found.</Text>
      </View>
    );
  }

  // Use local time when formatting string to avoid UTC shift issues
  const dateParts = memory.date.split('-');
  const formattedDate = new Date(
    parseInt(dateParts[0]), 
    parseInt(dateParts[1]) - 1, 
    parseInt(dateParts[2])
  ).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: memory.photoUri }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        {memory.caption ? (
          <Text style={styles.captionText}>{memory.caption}</Text>
        ) : (
          <Text style={styles.noCaptionText}>No caption provided.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', fontSize: 16 },
  errorText: { color: 'red', fontSize: 16 },
  content: { paddingBottom: 40 },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    resizeMode: 'contain',
    backgroundColor: '#111',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    minHeight: 200,
  },
  dateText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  captionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  noCaptionText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  }
});

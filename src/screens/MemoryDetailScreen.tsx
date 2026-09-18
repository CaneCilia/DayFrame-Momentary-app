import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryById, Memory } from '../database/memories';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} bounces={false}>
      <Image source={{ uri: memory.photoUri }} style={styles.image} />
      <View style={styles.infoContainer}>
        <View style={styles.dragIndicator} />
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

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary },
  loadingText: { color: theme.colors.text.inverse, fontSize: 16, fontWeight: '500' },
  errorText: { color: theme.colors.accent, fontSize: 16, fontWeight: '500' },
  content: { paddingBottom: 0 },
  image: {
    width: '100%',
    height: windowHeight * 0.65,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    marginTop: -theme.spacing.xl,
    minHeight: windowHeight * 0.35,
    ...theme.shadows.md,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  captionText: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    lineHeight: 28,
    fontWeight: '400',
  },
  noCaptionText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    opacity: 0.6,
  }
});

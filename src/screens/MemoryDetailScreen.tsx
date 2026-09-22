import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
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

  const polaroidRef = React.useRef<View>(null);

  const handleShare = async () => {
    try {
      const uri = await captureRef(polaroidRef, {
        format: 'png',
        quality: 1,
      });
      
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device');
        return;
      }
      
      await Sharing.shareAsync(uri, { dialogTitle: 'Share your memory' });
    } catch (error) {
      console.error('Failed to share memory:', error);
      Alert.alert('Failed to share memory');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} bounces={false}>
        <Image source={{ uri: memory.photoUri }} style={styles.image} />
        <View style={styles.infoContainer}>
          <View style={styles.dragIndicator} />
          <View style={styles.headerRow}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
          {memory.caption ? (
            <Text style={styles.captionText}>{memory.caption}</Text>
          ) : (
            <Text style={styles.noCaptionText}>A moment without words.</Text>
          )}
        </View>
      </ScrollView>

      {/* Off-screen Polaroid View for Sharing */}
      <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <View ref={polaroidRef} style={styles.polaroidContainer}>
          <View style={styles.polaroidImageContainer}>
            <Image source={{ uri: memory.photoUri }} style={styles.polaroidImage} />
          </View>
          <Text style={styles.polaroidDate}>{formattedDate}</Text>
          {memory.caption && <Text style={styles.polaroidCaption} numberOfLines={2}>{memory.caption}</Text>}
          <Text style={styles.polaroidBranding}>DayFrame</Text>
        </View>
      </View>
    </View>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  shareButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  shareText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  polaroidContainer: {
    width: 1080,
    backgroundColor: '#FFFFFF',
    padding: 40,
    paddingBottom: 80,
  },
  polaroidImageContainer: {
    width: 1000,
    height: 1000,
    backgroundColor: '#EAEAEA',
    marginBottom: 40,
  },
  polaroidImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  polaroidDate: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111111',
    fontFamily: 'sans-serif',
    marginBottom: 20,
  },
  polaroidCaption: {
    fontSize: 36,
    color: '#444444',
    fontFamily: 'serif',
    lineHeight: 48,
    marginBottom: 20,
  },
  polaroidBranding: {
    fontSize: 24,
    color: '#888888',
    textAlign: 'right',
    marginTop: 40,
    fontWeight: '600',
    letterSpacing: 2,
  }
});

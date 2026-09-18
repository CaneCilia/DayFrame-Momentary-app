import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryByDate, getCurrentStreak, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [todayMemory, setTodayMemory] = useState<Memory | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    // Use local time instead of UTC to avoid timezone issues where it's a different day
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const loadTodayMemory = async () => {
    setLoading(true);
    try {
      const todayDate = getTodayDateString();
      const memory = await getMemoryByDate(db, todayDate);
      setTodayMemory(memory);
      
      const currentStreak = await getCurrentStreak(db);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Failed to load today memory or streak:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadTodayMemory();
    }
  }, [isFocused]);

  const handleCapturePress = () => {
    navigation.navigate('Capture');
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{todayStr}</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : todayMemory ? (
        <View style={styles.memoryContainer}>
          <Image source={{ uri: todayMemory.photoUri }} style={styles.memoryImage} />
          {todayMemory.caption && (
            <Text style={styles.captionText}>{todayMemory.caption}</Text>
          )}
          <Text style={styles.completedText}>You've captured your moment for today!</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.emptyFrame} onPress={handleCapturePress}>
          <View style={styles.emptyFrameInner}>
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.emptyFrameText}>Tap to capture today's moment</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Timeline')}>
          <Text style={styles.navButtonText}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Calendar')}>
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.navButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  dateText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  emptyFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyFrameInner: {
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 48,
    color: '#ccc',
    marginBottom: 10,
  },
  emptyFrameText: {
    fontSize: 16,
    color: '#888',
  },
  memoryContainer: {
    width: '100%',
    alignItems: 'center',
  },
  memoryImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  captionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  completedText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    marginHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  }
});

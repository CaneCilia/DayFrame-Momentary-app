import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryByDate, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [todayMemory, setTodayMemory] = useState<Memory | null>(null);
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
    } catch (error) {
      console.error('Failed to load today memory:', error);
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
      <Text style={styles.dateText}>{todayStr}</Text>

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
  dateText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
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
  }
});

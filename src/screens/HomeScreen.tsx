import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryByDate, getCurrentStreak, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { SyncIndicator } from '../components/SyncIndicator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [todayMemory, setTodayMemory] = useState<Memory | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

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
        <View>
          <Text style={styles.greetingText}>Today</Text>
          <Text style={styles.dateText}>{todayStr}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.streakContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{streak}</Text>
          </View>
          <SyncIndicator />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading memory...</Text>
        </View>
      ) : todayMemory ? (
        <View style={styles.memoryContainer}>
          <Image source={{ uri: todayMemory.photoUri }} style={styles.memoryImage} />
          <View style={styles.memoryMeta}>
            {todayMemory.caption ? (
              <Text style={styles.captionText}>{todayMemory.caption}</Text>
            ) : null}
            <Text style={styles.completedText}>Memory captured ✓</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.emptyFrame} onPress={handleCapturePress} activeOpacity={0.9}>
          <Animated.View style={[styles.emptyFrameInner, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.iconCircle}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <Text style={styles.emptyFrameText}>Tap to capture</Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Timeline')} activeOpacity={0.7}>
          <Text style={styles.navButtonText}>Timeline</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Calendar')} activeOpacity={0.7}>
          <Text style={styles.navButtonText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
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
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  greetingText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  emptyFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFrameInner: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  plusIcon: {
    fontSize: 32,
    color: theme.colors.text.secondary,
    fontWeight: '300',
    marginTop: -4,
  },
  emptyFrameText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  memoryContainer: {
    width: '100%',
    alignItems: 'center',
  },
  memoryImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.border,
    ...theme.shadows.md,
  },
  memoryMeta: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  captionText: {
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  completedText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  navButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
  }
});

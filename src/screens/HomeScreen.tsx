import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, ScrollView, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryByDate, getOnThisDayMemories, getCurrentStreak, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { SyncIndicator } from '../components/SyncIndicator';
import { ContributionGraph } from '../components/ContributionGraph';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [todayMemory, setTodayMemory] = useState<Memory | null>(null);
  const [onThisDayMemories, setOnThisDayMemories] = useState<Memory[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const loadMemories = async () => {
    setLoading(true);
    try {
      const todayDate = getTodayDateString();
      const memory = await getMemoryByDate(db, todayDate);
      setTodayMemory(memory);
      
      const [year, month, day] = todayDate.split('-');
      const pastMemories = await getOnThisDayMemories(db, month, day, year);
      setOnThisDayMemories(pastMemories);

      const currentStreak = await getCurrentStreak(db);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Failed to load memories or streak:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadMemories();
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Today</Text>
            <Text style={styles.dateText}>{todayStr}</Text>
          </View>
          <View style={styles.headerRight}>
            <SyncIndicator />
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Feather name="zap" size={14} color={theme.colors.accent} />
                <Text style={styles.streakText}>{streak} Days</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading memory...</Text>
            </View>
          ) : todayMemory ? (
            <View style={styles.memoryContainer}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: todayMemory.photoUri }} style={styles.memoryImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                >
                  <View style={styles.memoryStatus}>
                    <Feather name="check-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.completedText}>Memory Secured</Text>
                  </View>
                </LinearGradient>
              </View>
              {todayMemory.caption && (
                <Text style={styles.captionText}>{todayMemory.caption}</Text>
              )}
            </View>
          ) : (
            <View style={styles.captureSection}>
              <Text style={styles.sectionHeading}>Capture the Moment</Text>
              <Text style={styles.sectionSubheading}>Save today's moments before they become memories.</Text>
              
              <View style={styles.captureActionRow}>
                <TouchableOpacity style={styles.actionCard} onPress={handleCapturePress} activeOpacity={0.8}>
                  <View style={styles.iconCircle}>
                    <Feather name="camera" size={24} color={theme.colors.text.primary} />
                  </View>
                  <Text style={styles.actionText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={handleCapturePress} activeOpacity={0.8}>
                  <View style={styles.iconCircle}>
                    <Feather name="video" size={24} color={theme.colors.text.primary} />
                  </View>
                  <Text style={styles.actionText}>Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.contributionSection}>
            <Text style={styles.sectionHeading}>Memory Contribution</Text>
            <Text style={styles.sectionSubheading}>Add stories, locations, and invite friends.</Text>
            <TouchableOpacity style={styles.contributeButton} activeOpacity={0.8}>
              <Feather name="plus" size={20} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.contributeButtonText}>Contribute to a Memory</Text>
            </TouchableOpacity>
            <ContributionGraph />
          </View>

          {onThisDayMemories.length > 0 && !loading && (
            <View style={styles.onThisDayContainer}>
              <Text style={styles.sectionHeading}>On This Day</Text>
              <Text style={styles.sectionSubheading}>Rediscover past years.</Text>
              {onThisDayMemories.map((mem) => {
                const yearsAgo = parseInt(getTodayDateString().split('-')[0]) - parseInt(mem.date.split('-')[0]);
                return (
                  <TouchableOpacity 
                    key={mem.id} 
                    style={styles.onThisDayCard}
                    onPress={() => navigation.navigate('MemoryDetail', { memoryId: mem.id })}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: mem.photoUri }} style={styles.onThisDayImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.onThisDayOverlay}
                    >
                      <Text style={styles.onThisDayYears}>{yearsAgo} {yearsAgo === 1 ? 'Year' : 'Years'} Ago Today</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}} activeOpacity={0.8}>
            <Feather name="home" size={24} color={theme.colors.primary} />
            <Text style={[styles.navText, { color: theme.colors.primary }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
            <Feather name="search" size={24} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Timeline')} activeOpacity={0.8}>
            <Feather name="grid" size={24} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Calendar')} activeOpacity={0.8}>
            <Feather name="calendar" size={24} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: { 
    flex: 1, 
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  greetingText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  streakText: {
    color: theme.colors.accent,
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  captureSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  contributionSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  sectionSubheading: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    fontWeight: '400',
  },
  captureActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  actionCardSmall: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  smallIcon: {
    marginRight: 8,
  },
  actionTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  contributeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  memoryContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  memoryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  completedText: {
    fontSize: 13,
    color: theme.colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  captionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginTop: theme.spacing.md,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.xs,
  },
  scrollContent: {
    width: '100%',
    paddingBottom: theme.spacing.xxl,
  },
  onThisDayContainer: {
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  onThisDayCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  onThisDayImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  onThisDayOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  onThisDayYears: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    color: theme.colors.text.secondary,
  }
});

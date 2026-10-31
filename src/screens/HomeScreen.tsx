import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryByDate, getOnThisDayMemories, getCurrentStreak, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { SyncIndicator } from '../components/SyncIndicator';
import { ContributionGraph } from '../components/ContributionGraph';
import { BottomNavBar } from '../components/BottomNavBar';
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
        {/* Editorial Top Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateHeading}>{todayStr}</Text>
            <Text style={styles.streakCaption}>
              {streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'} recorded in sequence` : 'Daily Visual Journal'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Search')} 
              style={styles.iconButton}
              accessibilityLabel="Search memories"
            >
              <Feather name="search" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Favorites')} 
              style={styles.iconButton}
              accessibilityLabel="Favorited memories"
            >
              <Feather name="heart" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')} 
              style={styles.iconButton}
              accessibilityLabel="Profile space and settings"
            >
              <Feather name="user" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <View style={styles.syncWrap}>
              <SyncIndicator />
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Opening today's page...</Text>
            </View>
          ) : todayMemory ? (
            /* Completed Today Memory: Museum Gallery Presentation */
            <View style={styles.memorySection}>
              <TouchableOpacity 
                style={styles.imageFrame}
                activeOpacity={0.95}
                onPress={() => navigation.navigate('MemoryDetail', { memoryId: todayMemory.id })}
              >
                <Image source={{ uri: todayMemory.photoUri }} style={styles.memoryImage} />
                <LinearGradient
                  colors={theme.gradients.scrimDark}
                  style={styles.imageScrim}
                >
                  <View style={styles.memoryBadge}>
                    <View style={styles.blueDot} />
                    <Text style={styles.badgeText}>Recorded Today</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              {todayMemory.caption ? (
                <Text style={styles.captionText}>{todayMemory.caption}</Text>
              ) : (
                <Text style={styles.emptyCaptionText}>A quiet moment captured today.</Text>
              )}
            </View>
          ) : (
            /* Empty Frame: Understated Invitation to Capture One Photo */
            <View style={styles.emptyFrameContainer}>
              <View style={styles.emptyFrame}>
                <View style={styles.viewfinderMarkTopLeft} />
                <View style={styles.viewfinderMarkTopRight} />
                <View style={styles.viewfinderMarkBottomLeft} />
                <View style={styles.viewfinderMarkBottomRight} />

                <Feather name="camera" size={32} color={theme.colors.text.secondary} style={styles.emptyFrameIcon} />
                <Text style={styles.emptyFrameTitle}>Today's Moment</Text>
                <Text style={styles.emptyFrameSubtitle}>
                  Capture one photograph that defines today before midnight.
                </Text>

                <TouchableOpacity 
                  style={styles.capturePrimaryButton}
                  onPress={handleCapturePress}
                  activeOpacity={0.85}
                >
                  <Feather name="camera" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.capturePrimaryText}>Record Today's Moment</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.gallerySecondaryButton}
                  onPress={() => navigation.navigate('Gallery')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gallerySecondaryText}>Select from Camera Roll</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Activity & Consistency Section */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Activity</Text>
                <Text style={styles.sectionSubtitle}>Journal entries recorded across recent weeks</Text>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Timeline')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sectionLinkText}>All Memories</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.graphContainer}>
              <ContributionGraph />
            </View>
          </View>

          {/* On This Day / Retrospective Section */}
          {onThisDayMemories.length > 0 && !loading ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>On This Day</Text>
              <Text style={styles.sectionSubtitle}>Anniversary moments from past years</Text>
              {onThisDayMemories.map((mem) => {
                const currentYear = parseInt(getTodayDateString().split('-')[0], 10);
                const memoryYear = parseInt(mem.date.split('-')[0], 10);
                const yearsAgo = currentYear - memoryYear;
                return (
                  <TouchableOpacity 
                    key={mem.id} 
                    style={styles.onThisDayCard}
                    onPress={() => navigation.navigate('MemoryDetail', { memoryId: mem.id })}
                    activeOpacity={0.92}
                  >
                    <Image source={{ uri: mem.photoUri }} style={styles.onThisDayImage} />
                    <LinearGradient
                      colors={theme.gradients.scrimDark}
                      style={styles.onThisDayOverlay}
                    >
                      <Text style={styles.onThisDayYears}>
                        {yearsAgo === 1 ? 'One Year Ago Today' : `${yearsAgo} Years Ago Today`}
                      </Text>
                      {mem.caption && (
                        <Text style={styles.onThisDayCaption} numberOfLines={1}>
                          {mem.caption}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : !loading && (
            <View style={styles.timeCapsuleNote}>
              <Text style={styles.capsuleHeading}>Annual Reflections</Text>
              <Text style={styles.capsuleBody}>
                Memories saved on this day will resurface here on their yearly anniversary.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Unified Editorial Bottom Navigation */}
        <BottomNavBar currentTab="Home" />
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  dateHeading: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  streakCaption: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  syncWrap: {
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },

  /* Completed Memory Presentation */
  memorySection: {
    marginBottom: theme.spacing.xl,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface.secondary,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  memoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 20, 28, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.xs,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginRight: 6,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  captionText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '400',
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
  emptyCaptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.md,
  },

  /* Empty Frame: Photographic Viewfinder */
  emptyFrameContainer: {
    marginBottom: theme.spacing.xl,
  },
  emptyFrame: {
    position: 'relative',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  viewfinderMarkTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: theme.colors.border,
  },
  viewfinderMarkTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 14,
    height: 14,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: theme.colors.border,
  },
  viewfinderMarkBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 14,
    height: 14,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: theme.colors.border,
  },
  viewfinderMarkBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 14,
    height: 14,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: theme.colors.border,
  },
  emptyFrameIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyFrameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptyFrameSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
    marginBottom: theme.spacing.lg,
  },
  capturePrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: theme.borderRadius.xs,
    width: '100%',
    maxWidth: 240,
  },
  capturePrimaryText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  gallerySecondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  gallerySecondaryText: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '500',
  },

  /* Section Structure */
  sectionBlock: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  sectionLinkText: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  graphContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },

  /* On This Day */
  onThisDayCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  onThisDayImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  onThisDayOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
  },
  onThisDayYears: {
    color: theme.colors.text.inverse,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  onThisDayCaption: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  timeCapsuleNote: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  capsuleHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  capsuleBody: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 17,
  },
});

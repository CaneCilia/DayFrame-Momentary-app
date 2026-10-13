import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories } from '../database/memories';
import {
  getUnifiedTimelineItems,
  getAllTimelineEvents,
  insertTimelineEvent,
  UnifiedTimelineItem,
  TimelineEvent,
  getTypeColor
} from '../database/timelineEvents';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { HorizontalTimeline } from '../components/HorizontalTimeline';
import { AddEventModal } from '../components/AddEventModal';
import { TimelineItemDetailModal } from '../components/TimelineItemDetailModal';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

type ViewMode = 'both' | 'calendar' | 'timeline';

export const CalendarScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<CalendarScreenNavigationProp>();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [unifiedItems, setUnifiedItems] = useState<UnifiedTimelineItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<UnifiedTimelineItem | null>(null);

  // Load both memories and timeline events
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let items = await getUnifiedTimelineItems(db);

      // If user has no events or memories yet, create illustrative starter items across the month
      if (items.length === 0) {
        const [yearStr, monthStr] = todayStr.split('-');
        const sampleEvents: TimelineEvent[] = [
          {
            id: 'sample-1',
            title: 'Morning Mountain Hike',
            type: 'photo',
            date: `${yearStr}-${monthStr}-01`,
            duration_hours: 4,
            notes: 'Spectacular sunrise views and peaceful trails.',
            photo_uri: null,
            color: '#0984E3',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-2',
            title: 'Design Sprint & Brainstorm',
            type: 'event',
            date: `${yearStr}-${monthStr}-05`,
            duration_hours: 6,
            notes: 'Quarterly roadmapping and sprint planning session.',
            photo_uri: null,
            color: '#00B894',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-3',
            title: 'Coffee Meetup with Sarah',
            type: 'note',
            date: `${yearStr}-${monthStr}-10`,
            duration_hours: 2,
            notes: 'Caught up on life and upcoming projects.',
            photo_uri: null,
            color: '#F39C12',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-4',
            title: 'Coastline Road Trip',
            type: 'memory',
            date: `${yearStr}-${monthStr}-15`,
            duration_hours: 8,
            notes: 'Cruising down the coastal highway with great music.',
            photo_uri: null,
            color: '#6C5CE7',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-5',
            title: 'Major Milestone Reached',
            type: 'milestone',
            date: `${yearStr}-${monthStr}-20`,
            duration_hours: 4,
            notes: 'Successfully achieved the 100-day journaling streak!',
            photo_uri: null,
            color: '#E17055',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-6',
            title: 'Sunset Photography Session',
            type: 'photo',
            date: `${yearStr}-${monthStr}-25`,
            duration_hours: 3,
            notes: 'Golden hour captures at the bay.',
            photo_uri: null,
            color: '#0984E3',
            created_at: new Date().toISOString()
          },
          {
            id: 'sample-7',
            title: 'Month End Review',
            type: 'note',
            date: `${yearStr}-${monthStr}-30`,
            duration_hours: 2,
            notes: 'Reflecting on achievements, learnings and memories.',
            photo_uri: null,
            color: '#F39C12',
            created_at: new Date().toISOString()
          }
        ];

        for (const sample of sampleEvents) {
          await insertTimelineEvent(db, sample);
        }

        items = await getUnifiedTimelineItems(db);
      }

      setUnifiedItems(items);
    } catch (e) {
      console.error('Failed to load timeline and calendar data:', e);
    } finally {
      setLoading(false);
    }
  }, [db, todayStr]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  // Construct marked dates for Calendar with multi-dot indicators
  const markedDates = useMemo(() => {
    const marks: { [date: string]: any } = {};

    unifiedItems.forEach((item) => {
      const itemDate = item.date;
      if (!marks[itemDate]) {
        marks[itemDate] = {
          dots: [],
          marked: true,
        };
      }

      const dotColor = item.color || getTypeColor(item.type);
      // Avoid duplicate dots of same color
      if (!marks[itemDate].dots.some((d: any) => d.color === dotColor)) {
        marks[itemDate].dots.push({
          key: `${item.type}-${item.id}`,
          color: dotColor,
        });
      }
    });

    // Highlight selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    }

    return marks;
  }, [unifiedItems, selectedDate]);

  // Items happening on the currently selected date
  const selectedDayItems = useMemo(() => {
    return unifiedItems.filter((i) => i.date === selectedDate);
  }, [unifiedItems, selectedDate]);

  // Monthly stats
  const memoryStats = useMemo(() => {
    const currentMonthPrefix = selectedDate ? selectedDate.substring(0, 7) : todayStr.substring(0, 7);
    const thisMonthItems = unifiedItems.filter((i) => i.date.startsWith(currentMonthPrefix));
    return {
      total: unifiedItems.length,
      thisMonth: thisMonthItems.length,
      memoriesCaptured: unifiedItems.filter((i) => i.type === 'memory' || i.type === 'photo').length,
    };
  }, [unifiedItems, selectedDate, todayStr]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleSelectItem = (item: UnifiedTimelineItem) => {
    setSelectedItemForModal(item);
  };

  const handleEventAdded = () => {
    loadData();
  };

  const handleItemDeleted = () => {
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Title and Add Event Button */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Timeline</Text>
            <Text style={styles.pageSubtitle}>Calendar & Visual Event Timeline</Text>
          </View>
          <TouchableOpacity
            style={styles.addEventHeaderBtn}
            onPress={() => setIsAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addEventHeaderBtnText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode Toggle: All-in-One / Calendar / Timeline */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'both' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('both')}
            activeOpacity={0.7}
          >
            <Feather
              name="layers"
              size={13}
              color={viewMode === 'both' ? '#FFFFFF' : theme.colors.text.secondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.viewModeText, viewMode === 'both' && styles.viewModeTextActive]}>
              All-in-One
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'calendar' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('calendar')}
            activeOpacity={0.7}
          >
            <Feather
              name="calendar"
              size={13}
              color={viewMode === 'calendar' ? '#FFFFFF' : theme.colors.text.secondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.viewModeTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'timeline' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('timeline')}
            activeOpacity={0.7}
          >
            <Feather
              name="bar-chart-2"
              size={13}
              color={viewMode === 'timeline' ? '#FFFFFF' : theme.colors.text.secondary}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}>
              Timeline
            </Text>
          </TouchableOpacity>
        </View>

        {/* Visual Horizontal Timeline */}
        {(viewMode === 'both' || viewMode === 'timeline') && (
          <HorizontalTimeline
            items={unifiedItems}
            onSelectItem={handleSelectItem}
            selectedDate={selectedDate}
          />
        )}

        {/* Calendar View */}
        {(viewMode === 'both' || viewMode === 'calendar') && (
          <View style={styles.calendarSection}>
            <View style={styles.calendarWrapper}>
              <Calendar
                current={selectedDate}
                markingType={'multi-dot'}
                markedDates={markedDates}
                onDayPress={onDayPress}
                theme={{
                  todayTextColor: theme.colors.accent,
                  selectedDayBackgroundColor: theme.colors.primary,
                  arrowColor: theme.colors.text.primary,
                  calendarBackground: 'transparent',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '800',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 15,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 13,
                }}
              />
            </View>

            {/* Selected Date Summary & Events */}
            <View style={styles.selectedDateCard}>
              <View style={styles.selectedDateHeader}>
                <View>
                  <Text style={styles.selectedDateLabel}>SELECTED DAY</Text>
                  <Text style={styles.selectedDateText}>
                    {new Date(selectedDate + 'T12:00:00Z').toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addForDateBtn}
                  onPress={() => setIsAddModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus-circle" size={15} color={theme.colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.addForDateText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {selectedDayItems.length === 0 ? (
                <View style={styles.noItemsBox}>
                  <Feather name="calendar" size={24} color={theme.colors.border} style={{ marginBottom: 6 }} />
                  <Text style={styles.noItemsText}>No memories or events recorded on this day.</Text>
                  <TouchableOpacity
                    style={styles.quickCaptureBtn}
                    onPress={() => setIsAddModalVisible(true)}
                  >
                    <Text style={styles.quickCaptureBtnText}>Create memory or event</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.dayItemsList}>
                  {selectedDayItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dayItemRow}
                      onPress={() => handleSelectItem(item)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.dayItemColorBar,
                          { backgroundColor: item.color || theme.colors.primary },
                        ]}
                      />
                      {item.photoUri ? (
                        <Image source={{ uri: item.photoUri }} style={styles.dayItemThumb} />
                      ) : (
                        <View style={[styles.dayItemThumbPlaceholder, { backgroundColor: item.color || theme.colors.primary }]}>
                          <Feather name={item.type === 'memory' ? 'heart' : item.type === 'photo' ? 'camera' : 'calendar'} size={14} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={styles.dayItemContent}>
                        <View style={styles.dayItemHeaderLine}>
                          <Text style={styles.dayItemTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.dayItemDateText}>{item.date}</Text>
                        </View>
                        <Text style={styles.dayItemMeta}>
                          {item.type.toUpperCase()} • {item.durationHours}h span
                          {item.notes ? ` • ${item.notes.substring(0, 36)}${item.notes.length > 36 ? '...' : ''}` : ''}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Overview Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Feather name="grid" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{memoryStats.total}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Feather name="calendar" size={18} color="#00B894" />
              </View>
              <Text style={styles.statValue}>{memoryStats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Feather name="heart" size={18} color="#6C5CE7" />
              </View>
              <Text style={styles.statValue}>{memoryStats.memoriesCaptured}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Feather name="home" size={22} color={theme.colors.text.secondary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
          <Feather name="calendar" size={22} color={theme.colors.primary} />
          <Text style={[styles.navText, { color: theme.colors.primary }]}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Gallery')}
          activeOpacity={0.8}
        >
          <Feather name="image" size={22} color={theme.colors.text.secondary} />
          <Text style={styles.navText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Timeline')}
          activeOpacity={0.8}
        >
          <Feather name="grid" size={22} color={theme.colors.text.secondary} />
          <Text style={styles.navText}>Memories</Text>
        </TouchableOpacity>
      </View>

      {/* Add Event / Memory Modal */}
      <AddEventModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onEventAdded={handleEventAdded}
        initialDate={selectedDate}
      />

      {/* Timeline Item Details Modal */}
      <TimelineItemDetailModal
        item={selectedItemForModal}
        visible={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onItemDeleted={handleItemDeleted}
      />
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  addEventHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
  addEventHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: theme.borderRadius.pill,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: 3,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  viewModeBtnActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  viewModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarSection: {
    marginTop: theme.spacing.lg,
  },
  calendarWrapper: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.md,
  },
  selectedDateCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  selectedDateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  addForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  addForDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  noItemsBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noItemsText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  quickCaptureBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  quickCaptureBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dayItemsList: {
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  dayItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 10,
    borderRadius: theme.borderRadius.md,
  },
  dayItemColorBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 10,
  },
  dayItemThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
  },
  dayItemContent: {
    flex: 1,
  },
  dayItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  dayItemMeta: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statsSection: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayItemThumbPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dayItemHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItemDateText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginLeft: 6,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: theme.spacing.sm,
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
  },
});

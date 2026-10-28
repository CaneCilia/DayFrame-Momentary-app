import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getUnifiedTimelineItems,
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
import { BottomNavBar } from '../components/BottomNavBar';

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
            color: theme.colors.itemTypes.photo,
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
            color: theme.colors.itemTypes.event,
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
            color: theme.colors.itemTypes.note,
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
            color: theme.colors.itemTypes.memory,
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
            color: theme.colors.itemTypes.milestone,
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
            color: theme.colors.itemTypes.photo,
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
            color: theme.colors.itemTypes.note,
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
      <View style={styles.container}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Editorial Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Calendar</Text>
              <Text style={styles.pageSubtitle}>Daily archive and scheduled timeline</Text>
            </View>
            <TouchableOpacity
              style={styles.addEventHeaderBtn}
              onPress={() => setIsAddModalVisible(true)}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addEventHeaderBtnText}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle: All / Calendar / Timeline */}
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'both' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('both')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode === 'both' && styles.viewModeTextActive]}>
                Combined
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'calendar' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('calendar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.viewModeTextActive]}>
                Month View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'timeline' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('timeline')}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewModeText, viewMode === 'timeline' && styles.viewModeTextActive]}>
                Timeline View
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visual Horizontal Timeline */}
          {(viewMode === 'both' || viewMode === 'timeline') && (
            <View style={styles.timelineWrapper}>
              <HorizontalTimeline
                items={unifiedItems}
                onSelectItem={handleSelectItem}
                selectedDate={selectedDate}
              />
            </View>
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
                    textMonthFontWeight: '600',
                    textDayHeaderFontWeight: '500',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                />
              </View>

              {/* Selected Date Summary & Events */}
              <View style={styles.selectedDateCard}>
                <View style={styles.selectedDateHeader}>
                  <View>
                    <Text style={styles.selectedDateLabel}>Selected Date</Text>
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
                    <Feather name="plus" size={13} color={theme.colors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.addForDateText}>Add Item</Text>
                  </TouchableOpacity>
                </View>

                {selectedDayItems.length === 0 ? (
                  <View style={styles.noItemsBox}>
                    <Text style={styles.noItemsText}>No memories or entries recorded on this day.</Text>
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
                            { backgroundColor: item.color || theme.colors.accent },
                          ]}
                        />
                        {item.photoUri ? (
                          <Image source={{ uri: item.photoUri }} style={styles.dayItemThumb} />
                        ) : (
                          <View style={[styles.dayItemThumbPlaceholder, { backgroundColor: theme.colors.surface.secondary }]}>
                            <Feather name={item.type === 'memory' ? 'heart' : item.type === 'photo' ? 'camera' : 'calendar'} size={12} color={theme.colors.text.secondary} />
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
                            {item.type} · {item.durationHours}h span
                            {item.notes ? ` · ${item.notes.substring(0, 36)}${item.notes.length > 36 ? '...' : ''}` : ''}
                          </Text>
                        </View>
                        <Feather name="chevron-right" size={14} color={theme.colors.text.tertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Overview Metrics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{memoryStats.total}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{memoryStats.thisMonth}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{memoryStats.memoriesCaptured}</Text>
                <Text style={styles.statLabel}>Photos Saved</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Unified Editorial Bottom Navigation */}
        <BottomNavBar currentTab="Calendar" />

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
  scrollArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xs,
  },
  addEventHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.borderRadius.xs,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: theme.borderRadius.xs,
  },
  viewModeBtnActive: {
    backgroundColor: theme.colors.card,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  viewModeTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  timelineWrapper: {
    marginTop: theme.spacing.md,
  },
  calendarSection: {
    marginTop: theme.spacing.md,
  },
  calendarWrapper: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    paddingBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedDateCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  selectedDateLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  addForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addForDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  noItemsBox: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  noItemsText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  dayItemsList: {
    marginTop: theme.spacing.sm,
    gap: 6,
  },
  dayItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.subtle,
    padding: 10,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  dayItemColorBar: {
    width: 3,
    height: 28,
    borderRadius: 1.5,
    marginRight: 10,
  },
  dayItemThumb: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.xs,
    marginRight: 10,
  },
  dayItemThumbPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dayItemContent: {
    flex: 1,
  },
  dayItemHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  dayItemDateText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginLeft: 6,
  },
  dayItemMeta: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statsSection: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

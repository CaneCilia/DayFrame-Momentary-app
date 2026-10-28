import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { MonthSummaryCard } from '../components/MonthSummaryCard';
import { BottomNavBar } from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

type TimelineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Timeline'>;

interface MemoryRow {
  id: string;
  items: Memory[];
  isSummary?: boolean;
  monthTitle?: string;
}

interface MonthSection {
  title: string;
  data: MemoryRow[];
}

export const TimelineScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<TimelineScreenNavigationProp>();
  const [memories, setMemories] = useState<Memory[]>([]);

  const loadMemories = async () => {
    try {
      const all = await getAllMemories(db);
      setMemories(all);
    } catch (e) {
      console.error('Failed to load timeline:', e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadMemories();
    }
  }, [isFocused]);

  const sections = useMemo(() => {
    const result: MonthSection[] = [];
    let currentMonth = '';
    let currentGroup: Memory[] = [];

    const flushGroup = () => {
      if (currentGroup.length > 0) {
        const rows: MemoryRow[] = [];
        
        // Inject Month Summary Card as the first item of each month
        rows.push({
          id: `summary-${currentMonth}`,
          isSummary: true,
          monthTitle: currentMonth,
          items: currentGroup,
        });

        for (let i = 0; i < currentGroup.length; i += 3) {
          rows.push({
            id: currentGroup[i].id + '-row',
            items: currentGroup.slice(i, i + 3)
          });
        }
        result.push({ title: currentMonth, data: rows });
      }
    };

    memories.forEach(m => {
      const [yearStr, monthStr] = m.date.split('-');
      const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const monthYear = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

      if (monthYear !== currentMonth) {
        flushGroup();
        currentMonth = monthYear;
        currentGroup = [m];
      } else {
        currentGroup.push(m);
      }
    });

    flushGroup();
    return result;
  }, [memories]);

  const renderItem = ({ item }: { item: MemoryRow }) => {
    if (item.isSummary && item.monthTitle) {
      return <MonthSummaryCard title={item.monthTitle} memories={item.items} />;
    }

    return (
      <View style={styles.rowContainer}>
        {item.items.map(memory => (
          <TouchableOpacity 
            key={memory.id}
            style={styles.itemContainer} 
            onPress={() => navigation.navigate('MemoryDetail', { memoryId: memory.id })}
            activeOpacity={0.88}
          >
            <Image source={{ uri: memory.photoUri }} style={styles.thumbnail} />
            <LinearGradient
              colors={theme.gradients.scrimDark}
              style={styles.gradientOverlay}
            />
            <Text style={styles.dateText}>
              {new Date(memory.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </Text>
          </TouchableOpacity>
        ))}
        {Array.from({ length: 3 - item.items.length }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.itemContainer, styles.emptyItem]} />
        ))}
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: MonthSection }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  };

  const sectionListRef = React.useRef<SectionList<MemoryRow, MonthSection>>(null);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    sections.forEach(sec => {
      const year = sec.title.split(' ').pop();
      if (year) yearSet.add(year);
    });
    return Array.from(yearSet);
  }, [sections]);

  const scrollToYear = (year: string) => {
    const index = sections.findIndex(sec => sec.title.endsWith(year));
    if (index !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: index,
        itemIndex: 0,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Memories</Text>
            <Text style={styles.pageSubtitle}>Complete chronological visual archive</Text>
          </View>
          <TouchableOpacity 
            style={styles.recapButton}
            onPress={() => navigation.navigate('YearlyRecap')}
            activeOpacity={0.85}
          >
            <Feather name="play" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.recapButtonText}>Year in Review</Text>
          </TouchableOpacity>
        </View>

        {memories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="grid" size={40} color={theme.colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No memories recorded yet</Text>
            <Text style={styles.emptySubText}>Save today's moment on the home screen to begin your visual diary.</Text>
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <SectionList
              ref={sectionListRef}
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={true}
              showsVerticalScrollIndicator={false}
            />
            {years.length > 1 && (
              <View style={styles.scrubberContainer}>
                {years.map(year => (
                  <TouchableOpacity key={year} onPress={() => scrollToYear(year)} style={styles.scrubberItem}>
                    <Text style={styles.scrubberText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Unified Editorial Bottom Navigation */}
        <BottomNavBar currentTab="Timeline" />
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - theme.spacing.lg * 2 - theme.spacing.xs * 2) / 3;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
  recapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.xs,
  },
  recapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 80,
  },
  emptyText: { 
    textAlign: 'center', 
    color: theme.colors.text.primary, 
    fontSize: 17, 
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  emptySubText: {
    textAlign: 'center', 
    color: theme.colors.text.secondary, 
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 260,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: { 
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    marginTop: theme.spacing.sm,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  itemContainer: {
    width: itemSize,
    height: itemSize,
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.secondary,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyItem: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  dateText: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.text.inverse,
  },
  scrubberContainer: {
    position: 'absolute',
    right: 8,
    top: 60,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrubberItem: {
    paddingVertical: 4,
  },
  scrubberText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.accent,
  },
});

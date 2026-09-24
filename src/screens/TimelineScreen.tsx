import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { MonthSummaryCard } from '../components/MonthSummaryCard';
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
        
        // Inject Month Summary Card as the first row
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
      // Extract YYYY and MM from YYYY-MM-DD
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
            activeOpacity={0.8}
          >
            <Image source={{ uri: memory.photoUri }} style={styles.thumbnail} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
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
          <Text style={styles.pageTitle}>Timeline</Text>
          <TouchableOpacity 
            style={styles.recapButton}
            onPress={() => navigation.navigate('YearlyRecap')}
            activeOpacity={0.8}
          >
            <Feather name="play-circle" size={16} color={theme.colors.text.inverse} style={{ marginRight: 6 }} />
            <Text style={styles.recapButtonText}>2026 Recap</Text>
          </TouchableOpacity>
        </View>
        {memories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="grid" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Your timeline is empty</Text>
            <Text style={styles.emptySubText}>Capture today's moment to start your journey.</Text>
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
                  <TouchableOpacity key={year} onPress={() => scrollToYear(year)}>
                    <Text style={styles.scrubberText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3;

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
    paddingRight: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.lg,
  },
  recapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
  recapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: { 
    textAlign: 'center', 
    color: theme.colors.text.primary, 
    fontSize: 20, 
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  emptySubText: {
    textAlign: 'center', 
    color: theme.colors.text.secondary, 
    fontSize: 16, 
  },
  listContent: { 
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: 'rgba(249, 249, 251, 0.95)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    width: itemSize,
    height: itemSize * 1.33,
    margin: theme.spacing.xs,
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  emptyItem: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  dateText: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    color: theme.colors.text.inverse,
    fontSize: 13,
    fontWeight: '800',
  },
  listWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  scrubberContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '30%',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  scrubberText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.sm,
    textAlign: 'center',
  }
});

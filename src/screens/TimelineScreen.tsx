import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { MonthSummaryCard } from '../components/MonthSummaryCard';

type TimelineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Timeline'>;

interface MemoryRow {
  id: string;
  items: Memory[];
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
            <View style={styles.gradientOverlay} />
            <Text style={styles.dateText}>
              {/* Parse strictly to avoid timezone jumping for display */}
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
    const memoryCount = section.data.reduce((total, row) => total + row.items.length, 0);
    return (
      <View style={styles.sectionHeader}>
        <MonthSummaryCard title={section.title} memoryCount={memoryCount} />
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
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Your Timeline</Text>
      {memories.length === 0 ? (
        <View style={styles.emptyContainer}>
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
  );
};

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - theme.spacing.md * 2 - theme.spacing.sm * 2) / 3;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
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
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  emptyItem: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
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
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dateText: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    color: theme.colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2
  },
  listWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  scrubberContainer: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: '25%',
    bottom: '25%',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  scrubberText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.xs,
    textAlign: 'center',
  }
});

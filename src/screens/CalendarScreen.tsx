import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

export const CalendarScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [memoryStats, setMemoryStats] = useState({ total: 0, thisMonth: 0 });

  const loadMemories = async () => {
    try {
      const all = await getAllMemories(db);
      const marks: { [date: string]: any } = {};
      
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      let thisMonthCount = 0;

      all.forEach(memory => {
        marks[memory.date] = { 
          selected: true, 
          selectedColor: theme.colors.primary, 
          memoryId: memory.id 
        };
        if (memory.date.startsWith(currentMonthStr)) {
          thisMonthCount++;
        }
      });

      setMarkedDates(marks);
      setMemoryStats({ total: all.length, thisMonth: thisMonthCount });
    } catch (e) {
      console.error('Failed to load memories for calendar:', e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadMemories();
    }
  }, [isFocused]);

  const onDayPress = (day: any) => {
    const memory = markedDates[day.dateString];
    if (memory && memory.memoryId) {
      navigation.navigate('MemoryDetail', { memoryId: memory.memoryId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Timeline</Text>
        </View>
        
        <View style={styles.calendarWrapper}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              todayTextColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              arrowColor: theme.colors.text.primary,
              calendarBackground: 'transparent',
              textDayFontWeight: '500',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <Feather name="camera" size={14} color={theme.colors.text.secondary} style={styles.legendIcon} />
            <Text style={styles.legendText}>Memory Captured</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Feather name="grid" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{memoryStats.total}</Text>
              <Text style={styles.statLabel}>Total Memories</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Feather name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{memoryStats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

      </ScrollView>
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
    backgroundColor: theme.colors.background 
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  calendarWrapper: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.md,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

export const CalendarScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});

  const loadMemories = async () => {
    try {
      const all = await getAllMemories(db);
      const marks: { [date: string]: any } = {};
      
      all.forEach(memory => {
        marks[memory.date] = { 
          selected: true, 
          selectedColor: '#007AFF', 
          memoryId: memory.id 
        };
      });

      setMarkedDates(marks);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Your Calendar</Text>
      
      <View style={styles.calendarWrapper}>
        <Calendar
          markedDates={markedDates}
          onDayPress={onDayPress}
          theme={{
            todayTextColor: '#007AFF',
            selectedDayBackgroundColor: '#007AFF',
            arrowColor: '#007AFF',
            calendarBackground: 'transparent',
          }}
        />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}><Text style={styles.legendIcon}>📸</Text><Text style={styles.legendText}>Memory</Text></View>
        <View style={styles.legendItem}><Text style={styles.legendIcon}>✈️</Text><Text style={styles.legendText}>Trip</Text></View>
        <View style={styles.legendItem}><Text style={styles.legendIcon}>🎉</Text><Text style={styles.legendText}>Event</Text></View>
        <View style={styles.legendItem}><Text style={styles.legendIcon}>🎂</Text><Text style={styles.legendText}>Birthday</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Trips</Text>
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>✈️ Trip: Goa</Text>
            <View style={styles.tripBadge}><Text style={styles.tripBadgeText}>5 Days</Text></View>
          </View>
          <Text style={styles.tripDates}>12 Jun → 16 Jun</Text>
          <Text style={styles.tripDescription}>Upcoming vacation with friends! Get ready to capture some sunny memories.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Overview</Text>
        <View style={styles.graphPlaceholder}>
          <Text style={styles.graphTitle}>Memories Added Per Month</Text>
          <View style={styles.mockChart}>
            {[40, 70, 45, 90, 65, 100].map((height, i) => (
              <View key={i} style={[styles.bar, { height: `${height}%` }]} />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
              <Text key={m} style={styles.chartLabelText}>{m}</Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  calendarWrapper: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  tripBadge: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tripBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tripDates: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  tripDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  graphPlaceholder: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  graphTitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 16,
  },
  mockChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bar: {
    width: 32,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    opacity: 0.8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabelText: {
    fontSize: 12,
    color: '#8E8E93',
    width: 32,
    textAlign: 'center',
  }
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Calendar</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={onDayPress}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
    </View>
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
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
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

  const loadMemories = async () => {
    try {
      const all = await getAllMemories(db);
      const marks: { [date: string]: any } = {};
      
      all.forEach(memory => {
        marks[memory.date] = { 
          selected: true, 
          selectedColor: theme.colors.primary, 
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

  const [eventModalVisible, setEventModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Timeline</Text>
          <TouchableOpacity onPress={() => setEventModalVisible(true)} style={styles.addEventBtn}>
            <Feather name="plus" size={16} color={theme.colors.text.inverse} style={{ marginRight: 6 }} />
            <Text style={styles.addEventBtnText}>Add Event</Text>
          </TouchableOpacity>
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
            <Text style={styles.legendText}>Memory</Text>
          </View>
          <View style={styles.legendItem}>
            <Feather name="map-pin" size={14} color={theme.colors.text.secondary} style={styles.legendIcon} />
            <Text style={styles.legendText}>Trip</Text>
          </View>
          <View style={styles.legendItem}>
            <Feather name="calendar" size={14} color={theme.colors.text.secondary} style={styles.legendIcon} />
            <Text style={styles.legendText}>Event</Text>
          </View>
          <View style={styles.legendItem}>
            <Feather name="gift" size={14} color={theme.colors.text.secondary} style={styles.legendIcon} />
            <Text style={styles.legendText}>Milestone</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          <View style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="map-pin" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.tripTitle}>Trip: Goa</Text>
              </View>
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

      {/* Add Event Modal */}
      {eventModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Event</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <View style={styles.inputWrapper}>
                <Feather name="calendar" size={16} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <Text style={styles.mockInputText}>Summer Roadtrip</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputWrapper}>
                <Feather name="clock" size={16} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <Text style={styles.mockInputText}>August 15, 2026</Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setEventModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={() => setEventModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>Save Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    justifyContent: 'space-around',
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  tripCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  tripBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  tripBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  tripDates: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  tripDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  graphPlaceholder: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  graphTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mockChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  bar: {
    width: 32,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  chartLabelText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  addEventBtnText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  inputIcon: {
    marginRight: 12,
  },
  mockInputText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  }
});

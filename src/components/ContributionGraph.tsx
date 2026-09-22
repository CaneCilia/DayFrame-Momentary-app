import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories } from '../database/memories';
import { theme } from '../utils/theme';
import { useIsFocused } from '@react-navigation/native';

export const ContributionGraph = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [memoryDates, setMemoryDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const allMemories = await getAllMemories(db);
        const dates = new Set(allMemories.map(m => m.date));
        setMemoryDates(dates);
      } catch (e) {
        console.error(e);
      }
    };
    if (isFocused) {
      fetchDates();
    }
  }, [db, isFocused]);

  const columns = 14; // Last 14 weeks
  const rows = 7;     // 7 days a week

  const renderGrid = () => {
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // We want the last column to end exactly on today's weekday
    const totalDays = columns * rows;
    
    const grid: (Date | null)[][] = Array.from({ length: columns }, () => Array(rows).fill(null));
    
    let currentDate = new Date(today);
    let currCol = columns - 1;
    let currRow = todayDayOfWeek;

    for (let i = 0; i < totalDays; i++) {
      if (currCol < 0) break;
      
      grid[currCol][currRow] = new Date(currentDate);
      
      currentDate.setDate(currentDate.getDate() - 1);
      
      currRow--;
      if (currRow < 0) {
        currRow = 6;
        currCol--;
      }
    }

    return (
      <View style={styles.graphWrapper}>
        <View style={styles.gridContainer}>
          {grid.map((col, colIndex) => (
            <View key={colIndex} style={styles.column}>
              {col.map((date, rowIndex) => {
                if (!date) {
                  return <View key={rowIndex} style={[styles.cell, styles.invisibleCell]} />;
                }
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                const dateString = localDate.toISOString().split('T')[0];
                
                const hasMemory = memoryDates.has(dateString);
                return (
                  <View 
                    key={rowIndex} 
                    style={[
                      styles.cell, 
                      hasMemory ? styles.filledCell : styles.unfilledCell
                    ]} 
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Memory Contributions</Text>
        <Text style={styles.countText}>{memoryDates.size} Photos</Text>
      </View>
      {renderGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  countText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  graphWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    width: 12,
    height: 12,
    margin: 2,
    borderRadius: 2,
  },
  filledCell: {
    backgroundColor: theme.colors.primary,
  },
  unfilledCell: {
    backgroundColor: theme.colors.border,
    opacity: 0.3,
  },
  invisibleCell: {
    backgroundColor: 'transparent',
  }
});

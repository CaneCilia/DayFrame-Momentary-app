import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Memory } from '../database/memories';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

type YearlyRecapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'YearlyRecap'>;

export const YearlyRecapScreen = ({ navigation }: { navigation: YearlyRecapScreenNavigationProp }) => {
  const db = useSQLiteContext();
  const [recapMemories, setRecapMemories] = useState<Memory[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchRecap = async () => {
      // Fetch all memories for the current year, then we'll pick the first from each month
      const all = await db.getAllAsync<Memory>(
        'SELECT * FROM memories WHERE date LIKE ? ORDER BY date ASC',
        [`${currentYear}-%`]
      );
      
      const monthlyPicks: Record<string, Memory> = {};
      all.forEach(m => {
        const month = m.date.split('-')[1];
        if (!monthlyPicks[month]) {
          monthlyPicks[month] = m;
        }
      });
      
      setRecapMemories(Object.values(monthlyPicks));
    };
    fetchRecap();
  }, [db, currentYear]);

  const renderStory = ({ item, index }: { item: Memory; index: number }) => {
    const monthName = new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' });
    return (
      <View style={styles.storyContainer}>
        <Image source={{ uri: item.photoUri }} style={styles.storyImage} />
        <View style={styles.overlay}>
          <Text style={styles.monthText}>{monthName}</Text>
          {item.caption ? <Text style={styles.captionText}>{item.caption}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentYear} Recap</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {recapMemories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not enough memories yet!</Text>
        </View>
      ) : (
        <FlatList
          data={recapMemories}
          renderItem={renderStory}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    position: 'absolute',
    top: 40,
    zIndex: 10,
    width: '100%',
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  closeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  storyContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 16,
  },
  monthText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  captionText: {
    color: '#EEE',
    fontSize: 18,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
  }
});

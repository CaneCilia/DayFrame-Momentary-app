import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

type TimelineScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Timeline'>;

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

  const renderItem = ({ item }: { item: Memory }) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.gradientOverlay} />
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {memories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No memories yet</Text>
          <Text style={styles.emptySubText}>Your captures will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
        />
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
  }
});

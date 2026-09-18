import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Memory, searchMemories } from '../database/memories';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

export const SearchScreen = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const hits = await searchMemories(db, query);
        setResults(hits);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, db]);

  const renderItem = ({ item }: { item: Memory }) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption || 'No caption'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search captions..."
          placeholderTextColor={theme.colors.text.secondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>
      
      {query.trim().length > 0 && results.length === 0 && !isSearching ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubText}>Try different keywords.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  searchBarContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: 16,
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
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  thumbnail: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.border,
  },
  textContainer: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  dateText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  captionText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
  }
});

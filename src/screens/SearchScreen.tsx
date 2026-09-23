import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Memory, searchMemories } from '../database/memories';
import { CategoryList } from '../components/CategoryList';
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
            {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
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
      <Text style={styles.pageTitle}>Search</Text>
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
      
      {query.trim().length === 0 ? (
        <ScrollView style={styles.v3Container}>
          <CategoryList 
            title="Explore Slideshows"
            categories={[
              { id: 'travel', label: 'Travel', icon: '✈️' },
              { id: 'birthday', label: 'Birthday', icon: '🎂' },
              { id: 'wedding', label: 'Wedding', icon: '💍' },
              { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
              { id: 'nature', label: 'Nature', icon: '🌲' },
            ]} 
          />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.templateCard}>
                  <View style={styles.templateThumb} />
                  <Text style={styles.templateName}>Cinematic Story {i}</Text>
                  <Text style={styles.templateMeta}>12 Photos • Travel</Text>
                  <TouchableOpacity style={styles.useButton}>
                    <Text style={styles.useButtonText}>Use Template</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentSearchChips}>
              {['beach', 'summer 2026', 'birthday party'].map(term => (
                <TouchableOpacity key={term} style={styles.recentChip} onPress={() => setQuery(term)}>
                  <Text style={styles.recentChipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : query.trim().length > 0 && results.length === 0 && !isSearching ? (
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
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
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
  },
  v3Container: {
    flex: 1,
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
  },
  horizontalScroll: {
    paddingBottom: theme.spacing.md,
  },
  templateCard: {
    width: 220,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  templateThumb: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  templateMeta: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  useButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
  },
  useButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: '700',
    fontSize: 14,
  },
  recentSearchChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  recentChipText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  }
});

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Memory, searchMemories, getAllMemories } from '../database/memories';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const FILTER_TAGS = ['All', 'Favorites', 'Recent', 'Reflections'];

export const SearchScreen = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState<Memory[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const all = await getAllMemories(db);
        setRecentMemories(all.slice(0, 6));
      } catch (e) {}
    };
    if (isFocused) fetchRecent();
  }, [isFocused, db]);

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
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [query, db]);

  // Apply quick filter if search query is empty
  const displayedRecent = useMemo(() => {
    if (activeFilter === 'Favorites') {
      return recentMemories.filter(m => !!m.is_favorite);
    }
    return recentMemories;
  }, [recentMemories, activeFilter]);

  const renderHighlightedText = (text: string | undefined | null) => {
    if (!text) return <Text style={styles.captionText}>A moment without caption.</Text>;
    
    const parts = text.split(/(<b>.*?<\/b>)/g);
    
    return (
      <Text style={styles.captionText} numberOfLines={2}>
        {parts.map((part, index) => {
          if (part.startsWith('<b>') && part.endsWith('</b>')) {
            return (
              <Text key={index} style={{ fontWeight: '600', color: theme.colors.accent }}>
                {part.replace(/<\/?b>/g, '')}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: Memory }) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
        activeOpacity={0.88}
      >
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.dateText}>
            {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            })}
          </Text>
          {renderHighlightedText(item.highlighted_caption || item.caption)}
        </View>
        <Feather name="chevron-right" size={16} color={theme.colors.text.tertiary} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Editorial Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Search Archive</Text>
            <Text style={styles.pageSubtitle}>Search daily diary captions and memories</Text>
          </View>
        </View>
        
        {/* Search Input */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={16} color={theme.colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by caption or keyword..."
              placeholderTextColor={theme.colors.text.secondary}
              value={query}
              onChangeText={setQuery}
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Feather name="x" size={16} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Tags */}
          <View style={styles.filterRow}>
            {FILTER_TAGS.map((tag) => {
              const isActive = activeFilter === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {query.trim().length === 0 ? (
          <ScrollView style={styles.v3Container} showsVerticalScrollIndicator={false}>
            {displayedRecent.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Diary Highlights</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {displayedRecent.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.highlightCard}
                      activeOpacity={0.92}
                      onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
                    >
                      <Image source={{ uri: item.photoUri }} style={styles.highlightThumb} />
                      <LinearGradient
                        colors={theme.gradients.scrimDark}
                        style={styles.highlightGradient}
                      >
                        <Text style={styles.highlightCaption} numberOfLines={1}>
                          {item.caption || 'Daily moment'}
                        </Text>
                        <Text style={styles.highlightMeta}>
                          {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'UTC',
                          })}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={32} color={theme.colors.border} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Find any past memory</Text>
                <Text style={styles.emptySubText}>Type words you used in your past daily journal captions.</Text>
              </View>
            )}
          </ScrollView>
        ) : query.trim().length > 0 && results.length === 0 && !isSearching ? (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={32} color={theme.colors.border} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No matching memories found</Text>
            <Text style={styles.emptySubText}>Try searching with a broader keyword or date fragment.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: -8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  searchBarContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: theme.colors.text.primary,
    fontSize: 13,
  },
  clearBtn: {
    padding: 10,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 80,
  },
  emptyText: { 
    textAlign: 'center', 
    color: theme.colors.text.primary, 
    fontSize: 15, 
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  emptySubText: {
    textAlign: 'center', 
    color: theme.colors.text.secondary, 
    fontSize: 12, 
    lineHeight: 18,
    maxWidth: 240,
  },
  listContent: { 
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.surface.secondary,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  chevron: {
    paddingRight: 12,
  },
  dateText: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  captionText: {
    color: theme.colors.text.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  v3Container: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  horizontalScroll: {
    paddingBottom: theme.spacing.sm,
    gap: 10,
  },
  highlightCard: {
    width: 170,
    height: 220,
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  highlightThumb: {
    width: '100%',
    height: '100%',
  },
  highlightGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  highlightCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  highlightMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
});

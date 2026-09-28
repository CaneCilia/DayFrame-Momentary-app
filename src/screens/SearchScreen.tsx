import React, { useState, useEffect } from 'react';
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

export const SearchScreen = () => {
  const db = useSQLiteContext();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Memory[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const all = await getAllMemories(db);
        setRecentMemories(all.slice(0, 5)); // Get top 5 most recent
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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, db]);

  const renderHighlightedText = (text: string | undefined | null) => {
    if (!text) return <Text style={styles.captionText}>No caption</Text>;
    
    const parts = text.split(/(<b>.*?<\/b>)/g);
    
    return (
      <Text style={styles.captionText} numberOfLines={2}>
        {parts.map((part, index) => {
          if (part.startsWith('<b>') && part.endsWith('</b>')) {
            return (
              <Text key={index} style={{ fontWeight: '800', color: theme.colors.primary }}>
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
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.dateText}>
            {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </Text>
          {renderHighlightedText(item.highlighted_caption || item.caption)}
        </View>
        <Feather name="chevron-right" size={20} color={theme.colors.border} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Explore</Text>
        </View>
        
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Feather name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search memories by caption..."
              placeholderTextColor={theme.colors.text.secondary}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Feather name="x-circle" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {query.trim().length === 0 ? (
          <ScrollView style={styles.v3Container} showsVerticalScrollIndicator={false}>
            {recentMemories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Highlights</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {recentMemories.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.templateCard}
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate('MemoryDetail', { memoryId: item.id })}
                    >
                      <View style={styles.templateThumbWrapper}>
                        <Image source={{ uri: item.photoUri }} style={styles.templateThumb} />
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.85)']}
                          style={styles.templateGradient}
                        />
                      </View>
                      <View style={styles.templateInfo}>
                        <Text style={styles.templateName} numberOfLines={1}>{item.caption || "A moment to remember"}</Text>
                        <Text style={styles.templateMeta}>
                          {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        ) : query.trim().length > 0 && results.length === 0 && !isSearching ? (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No moments found</Text>
            <Text style={styles.emptySubText}>Try a different keyword.</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  searchBarContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...theme.shadows.sm,
  },
  searchIcon: {
    paddingLeft: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  clearBtn: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: theme.colors.border,
  },
  textContainer: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  chevron: {
    paddingRight: theme.spacing.md,
  },
  dateText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  captionText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  v3Container: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  horizontalScroll: {
    paddingBottom: theme.spacing.md,
  },
  templateCard: {
    width: 240,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  templateThumbWrapper: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  templateThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  templateGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
  },
  templateInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  templateMeta: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  }
});

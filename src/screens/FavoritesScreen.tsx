import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getFavoriteMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export const FavoritesScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [favorites, setFavorites] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favs = await getFavoriteMemories(db);
      setFavorites(favs);
    } catch (e) {
      console.error('Failed to load favorites:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

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
          {item.caption ? (
            <Text style={styles.captionText} numberOfLines={2}>{item.caption}</Text>
          ) : (
            <Text style={styles.noCaptionText}>A quiet moment without caption.</Text>
          )}
        </View>
        <Feather name="heart" size={16} color={theme.colors.accent} style={styles.heartIcon} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Favorites</Text>
            <Text style={styles.pageSubtitle}>Curated collection of saved moments</Text>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySubText}>Opening favorites...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={32} color={theme.colors.border} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No favorited moments</Text>
            <Text style={styles.emptySubText}>Tap the heart icon on any memory to collect your favorites here.</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    paddingBottom: theme.spacing.sm,
  },
  backBtn: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 80,
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
  heartIcon: {
    paddingRight: 14,
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
  noCaptionText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  }
});

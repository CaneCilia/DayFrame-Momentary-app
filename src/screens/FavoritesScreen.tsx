import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getFavoriteMemories, Memory } from '../database/memories';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.dateText}>
            {new Date(item.date + 'T12:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </Text>
          {item.caption ? (
            <Text style={styles.captionText} numberOfLines={2}>{item.caption}</Text>
          ) : (
            <Text style={styles.noCaptionText}>A moment without words.</Text>
          )}
        </View>
        <Feather name="heart" size={20} color={theme.colors.accent} style={styles.heartIcon} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Favorites</Text>
        </View>
        
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={48} color={theme.colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubText}>Tap the heart icon on your favorite memories to collect them here.</Text>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backBtn: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 40,
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
    lineHeight: 24,
  },
  listContent: { 
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
  heartIcon: {
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  noCaptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    opacity: 0.6,
  }
});

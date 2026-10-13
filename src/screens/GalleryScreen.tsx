import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import {
  Folder,
  Album,
  GalleryMediaItem,
  getFolders,
  getAlbums,
  createFolder,
  createAlbum,
  getAllGalleryMedia,
  addItemToAlbum
} from '../database/gallery';
import { PhotoViewerModal } from '../components/PhotoViewerModal';
import { AlbumDetailModal } from '../components/AlbumDetailModal';
import { FolderModal } from '../components/FolderModal';

type GalleryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gallery'>;

type MainTab = 'all' | 'albums' | 'folders' | 'memories' | 'favorites';
type QuickFilter = 'all' | 'video' | 'favorite' | 'recent' | 'memory' | 'albums' | 'folders';

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - theme.spacing.lg * 2 - theme.spacing.sm * 2) / 3;

export const GalleryScreen = () => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation<GalleryScreenNavigationProp>();

  const [activeTab, setActiveTab] = useState<MainTab>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [mediaItems, setMediaItems] = useState<GalleryMediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // Modals
  const [activePhoto, setActivePhoto] = useState<GalleryMediaItem | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);

  // Load all gallery contents
  const loadGalleryData = useCallback(async () => {
    try {
      setLoading(true);
      let [fetchedMedia, fetchedAlbums, fetchedFolders] = await Promise.all([
        getAllGalleryMedia(db),
        getAlbums(db, null),
        getFolders(db, null),
      ]);

      // Seed starter albums & folders if completely fresh
      if (fetchedAlbums.length === 0 && fetchedFolders.length === 0) {
        const rootFolder = await createFolder(db, 'Personal Archives');
        await createFolder(db, 'Trips & Adventures', rootFolder.id);

        const album1 = await createAlbum(db, 'Highlights', null, rootFolder.id);
        const album2 = await createAlbum(db, 'Life Moments', null);

        // If we have any existing memories, add to starter album
        if (fetchedMedia.length > 0) {
          for (let i = 0; i < Math.min(fetchedMedia.length, 3); i++) {
            await addItemToAlbum(db, album1.id, fetchedMedia[i].uri, fetchedMedia[i].title);
          }
        }

        [fetchedMedia, fetchedAlbums, fetchedFolders] = await Promise.all([
          getAllGalleryMedia(db),
          getAlbums(db, null),
          getFolders(db, null),
        ]);
      }

      setMediaItems(fetchedMedia);
      setAlbums(fetchedAlbums);
      setFolders(fetchedFolders);
    } catch (e) {
      console.error('Failed to load gallery data:', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (isFocused) {
      loadGalleryData();
    }
  }, [isFocused, loadGalleryData]);

  // Main tabs
  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: 'all', label: 'All Photos' },
    { key: 'albums', label: 'Albums' },
    { key: 'folders', label: 'Folders' },
    { key: 'memories', label: 'Memories' },
    { key: 'favorites', label: 'Favorites' },
  ];

  // Quick structure categories
  const QUICK_FILTERS: { key: QuickFilter; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: 'all', label: 'All Photos', icon: 'image' },
    { key: 'video', label: 'Videos', icon: 'video' },
    { key: 'favorite', label: 'Favorites', icon: 'heart' },
    { key: 'recent', label: 'Recently Added', icon: 'clock' },
    { key: 'memory', label: 'Memories', icon: 'calendar' },
    { key: 'albums', label: 'Albums', icon: 'grid' },
    { key: 'folders', label: 'Folders', icon: 'folder' },
  ];

  // Filter media items
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      // Query filter
      if (searchQuery.trim()) {
        const matchTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDate = item.date.includes(searchQuery);
        if (!matchTitle && !matchDate) return false;
      }

      // Tab filter
      if (activeTab === 'memories' && item.type !== 'memory') return false;
      if (activeTab === 'favorites' && !item.is_favorite) return false;

      // Quick filter
      if (quickFilter === 'video' && item.type !== 'video') return false;
      if (quickFilter === 'favorite' && !item.is_favorite) return false;
      if (quickFilter === 'memory' && item.type !== 'memory') return false;
      if (quickFilter === 'recent') {
        const itemDate = new Date(item.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (itemDate < thirtyDaysAgo) return false;
      }

      return true;
    });
  }, [mediaItems, activeTab, quickFilter, searchQuery]);

  // Filtered albums & folders
  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    return albums.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [albums, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    return folders.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, searchQuery]);

  // Create Album Action
  const handleCreateAlbum = () => {
    Alert.prompt
      ? Alert.prompt('New Album', 'Enter name for your new album:', async (name) => {
          if (name && name.trim()) {
            await createAlbum(db, name.trim());
            loadGalleryData();
          }
        })
      : Alert.alert('Create Album', 'To add an album, import photos from camera roll.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import Photos to New Album',
            onPress: async () => {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              });
              if (!res.canceled && res.assets && res.assets.length > 0) {
                const alb = await createAlbum(db, 'New Collection', res.assets[0].uri);
                await addItemToAlbum(db, alb.id, res.assets[0].uri);
                loadGalleryData();
              }
            },
          },
        ]);
  };

  // Create Folder Action
  const handleCreateFolder = () => {
    Alert.prompt
      ? Alert.prompt('New Folder', 'Enter folder name:', async (name) => {
          if (name && name.trim()) {
            await createFolder(db, name.trim());
            loadGalleryData();
          }
        })
      : (async () => {
          await createFolder(db, `Folder ${folders.length + 1}`);
          loadGalleryData();
        })();
  };

  // Add Photos directly to gallery
  const handleAddPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        let targetAlbum = albums[0];
        if (!targetAlbum) {
          targetAlbum = await createAlbum(db, 'Camera Roll');
        }

        for (const asset of result.assets) {
          await addItemToAlbum(
            db,
            targetAlbum.id,
            asset.uri,
            asset.fileName || 'Photo',
            'photo',
            new Date().toISOString().split('T')[0]
          );
        }

        loadGalleryData();
      }
    } catch (e) {
      console.warn('Import photos error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Gallery</Text>
            <Text style={styles.pageSubtitle}>Memories & Photos</Text>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.addMediaBtn} onPress={handleAddPhotos} activeOpacity={0.8}>
              <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addMediaBtnText}>Add Photos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos, albums, and folders..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Main Tabs (All Photos · Albums · Folders · Memories · Favorites) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mainTabsScroll}
        >
          {MAIN_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.mainTabPill, isSelected && styles.mainTabPillActive]}
                onPress={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'albums') setQuickFilter('albums');
                  else if (tab.key === 'folders') setQuickFilter('folders');
                  else if (tab.key === 'memories') setQuickFilter('memory');
                  else if (tab.key === 'favorites') setQuickFilter('favorite');
                  else setQuickFilter('all');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.mainTabPillText, isSelected && styles.mainTabPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Structure Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterScroll}
        >
          {QUICK_FILTERS.map((qf) => {
            const isActive = quickFilter === qf.key;
            return (
              <TouchableOpacity
                key={qf.key}
                style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
                onPress={() => {
                  setQuickFilter(qf.key);
                  if (qf.key === 'albums') setActiveTab('albums');
                  else if (qf.key === 'folders') setActiveTab('folders');
                  else if (qf.key === 'memory') setActiveTab('memories');
                  else if (qf.key === 'favorite') setActiveTab('favorites');
                }}
                activeOpacity={0.7}
              >
                <Feather
                  name={qf.icon}
                  size={12}
                  color={isActive ? '#FFFFFF' : theme.colors.text.secondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.quickFilterText,
                    isActive && styles.quickFilterTextActive,
                  ]}
                >
                  {qf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main Content Body */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Organizing gallery...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.contentScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentBody}
          >
            {/* Albums Section View */}
            {(activeTab === 'albums' || quickFilter === 'albums') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>Albums</Text>
                  <TouchableOpacity style={styles.createLink} onPress={handleCreateAlbum}>
                    <Feather name="plus-circle" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.createLinkText}>Create Album</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.albumGrid}>
                  {filteredAlbums.map((album) => (
                    <TouchableOpacity
                      key={album.id}
                      style={styles.albumCard}
                      onPress={() => setActiveAlbum(album)}
                      activeOpacity={0.8}
                    >
                      {album.cover_photo_uri ? (
                        <Image source={{ uri: album.cover_photo_uri }} style={styles.albumCoverImage} />
                      ) : (
                        <View style={styles.albumPlaceholderCover}>
                          <Feather name="image" size={32} color={theme.colors.border} />
                        </View>
                      )}
                      <Text style={styles.albumCardTitle} numberOfLines={1}>
                        {album.name}
                      </Text>
                      <Text style={styles.albumCardMeta}>{album.item_count || 0} items</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Folders Section View */}
            {(activeTab === 'folders' || quickFilter === 'folders') && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>Folders</Text>
                  <TouchableOpacity style={styles.createLink} onPress={handleCreateFolder}>
                    <Feather name="folder-plus" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.createLinkText}>Create Folder</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.folderGrid}>
                  {filteredFolders.map((folder) => (
                    <TouchableOpacity
                      key={folder.id}
                      style={styles.folderCard}
                      onPress={() => setActiveFolder(folder)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.folderCardIcon}>
                        <Feather name="folder" size={28} color={theme.colors.primary} />
                      </View>
                      <Text style={styles.folderCardTitle} numberOfLines={1}>
                        {folder.name}
                      </Text>
                      <Text style={styles.folderCardMeta}>
                        {folder.subfolder_count || 0} subfolders • {folder.album_count || 0} albums
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Media Photo Grid View */}
            {activeTab !== 'albums' && activeTab !== 'folders' && quickFilter !== 'albums' && quickFilter !== 'folders' && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    {activeTab === 'memories'
                      ? 'Daily Captured Memories'
                      : activeTab === 'favorites'
                      ? 'Favorites'
                      : 'All Photos & Media'}
                  </Text>
                  <Text style={styles.mediaCountBadge}>{filteredMedia.length} Items</Text>
                </View>

                {filteredMedia.length === 0 ? (
                  <View style={styles.emptyMediaBox}>
                    <Feather name="camera" size={42} color={theme.colors.border} style={{ marginBottom: 10 }} />
                    <Text style={styles.emptyMediaTitle}>No media found</Text>
                    <Text style={styles.emptyMediaSub}>Add photos or capture moments to fill your gallery.</Text>
                  </View>
                ) : (
                  <View style={styles.photoGrid}>
                    {filteredMedia.map((media) => (
                      <TouchableOpacity
                        key={media.id}
                        style={styles.photoGridItem}
                        onPress={() => {
                          if (media.type === 'memory') {
                            navigation.navigate('MemoryDetail', { memoryId: media.id });
                          } else {
                            setActivePhoto(media);
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: media.uri }} style={styles.photoThumbnail} />

                        {/* Top indicator badge */}
                        {media.type === 'memory' && (
                          <View style={styles.memoryBadge}>
                            <Feather name="heart" size={10} color="#FFFFFF" />
                          </View>
                        )}
                        {media.type === 'video' && (
                          <View style={styles.videoBadge}>
                            <Feather name="video" size={10} color="#FFFFFF" />
                          </View>
                        )}

                        {/* Date overlay */}
                        <View style={styles.dateOverlay}>
                          <Text style={styles.dateOverlayText}>
                            {new Date(media.date + 'T12:00:00Z').toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Bottom Navigation Bar: Home | Calendar | Gallery | Memories */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Feather name="home" size={22} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Calendar')}
            activeOpacity={0.8}
          >
            <Feather name="calendar" size={22} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.8}>
            <Feather name="image" size={22} color={theme.colors.primary} />
            <Text style={[styles.navText, { color: theme.colors.primary }]}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Timeline')}
            activeOpacity={0.8}
          >
            <Feather name="grid" size={22} color={theme.colors.text.secondary} />
            <Text style={styles.navText}>Memories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      <PhotoViewerModal
        visible={!!activePhoto}
        uri={activePhoto?.uri || null}
        title={activePhoto?.title || null}
        date={activePhoto?.date || null}
        type={activePhoto?.type || 'photo'}
        onClose={() => setActivePhoto(null)}
      />

      <AlbumDetailModal
        album={activeAlbum}
        visible={!!activeAlbum}
        onClose={() => setActiveAlbum(null)}
        onAlbumUpdated={loadGalleryData}
        onAlbumDeleted={loadGalleryData}
      />

      <FolderModal
        folder={activeFolder}
        visible={!!activeFolder}
        onClose={() => setActiveFolder(null)}
        onFolderUpdated={loadGalleryData}
        onOpenSubfolder={(sub) => setActiveFolder(sub)}
        onOpenAlbum={(alb) => {
          setActiveFolder(null);
          setActiveAlbum(alb);
        }}
      />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
  addMediaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.pill,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  mainTabsScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    gap: 8,
  },
  mainTabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  mainTabPillActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  mainTabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  mainTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickFilterScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    gap: 6,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quickFilterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  quickFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  quickFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 8,
  },
  contentScrollView: {
    flex: 1,
  },
  contentBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginTop: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  mediaCountBadge: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  albumCard: {
    width: (windowWidth - theme.spacing.lg * 2 - 12) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  albumCoverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    marginBottom: 8,
  },
  albumPlaceholderCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  albumCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  albumCardMeta: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  folderCard: {
    width: (windowWidth - theme.spacing.lg * 2 - 12) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  folderCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  folderCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  folderCardMeta: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  photoGridItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.card,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  memoryBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  dateOverlayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyMediaBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMediaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  emptyMediaSub: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    color: theme.colors.text.secondary,
  },
});

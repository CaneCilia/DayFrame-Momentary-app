import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { theme } from '../utils/theme';
import {
  Album,
  AlbumItem,
  getAlbumItems,
  addItemToAlbum,
  removeItemFromAlbum,
  renameAlbum,
  deleteAlbum,
  setAlbumCover
} from '../database/gallery';
import { PhotoViewerModal } from './PhotoViewerModal';

interface AlbumDetailModalProps {
  album: Album | null;
  visible: boolean;
  onClose: () => void;
  onAlbumUpdated: () => void;
  onAlbumDeleted: () => void;
}

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - theme.spacing.lg * 2 - theme.spacing.sm * 2) / 3;

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  album,
  visible,
  onClose,
  onAlbumUpdated,
  onAlbumDeleted,
}) => {
  const db = useSQLiteContext();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [isRenaming, setIsRenaming] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [activePhoto, setActivePhoto] = useState<AlbumItem | null>(null);

  const loadItems = useCallback(async () => {
    if (!album) return;
    try {
      const result = await getAlbumItems(db, album.id, sortBy);
      setItems(result);
    } catch (e) {
      console.error('Failed to load album items:', e);
    }
  }, [db, album, sortBy]);

  useEffect(() => {
    if (visible && album) {
      setAlbumName(album.name);
      setIsRenaming(false);
      loadItems();
    }
  }, [visible, album, loadItems]);

  if (!album) return null;

  const handleAddPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        for (const asset of result.assets) {
          await addItemToAlbum(
            db,
            album.id,
            asset.uri,
            asset.fileName || 'Photo',
            'photo',
            new Date().toISOString().split('T')[0]
          );
        }
        await loadItems();
        onAlbumUpdated();
      }
    } catch (e) {
      console.warn('Image picker error:', e);
      Alert.alert('Error', 'Unable to import selected photos.');
    }
  };

  const handleShareAlbum = async () => {
    try {
      if (album.cover_photo_uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(album.cover_photo_uri, {
          dialogTitle: `Share Album: ${album.name}`,
        });
      } else {
        Alert.alert('Album Sharing', `Album "${album.name}" with ${items.length} photos.`);
      }
    } catch (e) {
      console.warn('Share album error:', e);
    }
  };

  const handleSaveRename = async () => {
    if (!albumName.trim()) return;
    try {
      await renameAlbum(db, album.id, albumName.trim());
      setIsRenaming(false);
      onAlbumUpdated();
    } catch (e) {
      console.error('Rename album error:', e);
      Alert.alert('Error', 'Could not rename album.');
    }
  };

  const handleDeleteAlbum = () => {
    Alert.alert(
      'Delete Album',
      `Are you sure you want to delete "${album.name}"? Photos will remain in your memories.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAlbum(db, album.id);
              onAlbumDeleted();
              onClose();
            } catch (e) {
              console.error('Delete album error:', e);
              Alert.alert('Error', 'Could not delete album.');
            }
          },
        },
      ]
    );
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemFromAlbum(db, album.id, itemId);
      await loadItems();
      onAlbumUpdated();
    } catch (e) {
      console.error('Remove item error:', e);
    }
  };

  const handleSetCover = async (photoUri: string) => {
    try {
      await setAlbumCover(db, album.id, photoUri);
      onAlbumUpdated();
      Alert.alert('Updated', 'Album cover photo updated.');
    } catch (e) {
      console.error('Set cover error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="chevron-left" size={26} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.topActions}>
            <TouchableOpacity onPress={handleShareAlbum} style={styles.iconButton}>
              <Feather name="share-2" size={18} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAlbum} style={styles.iconButton}>
              <Feather name="trash-2" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Album Cover & Title Banner */}
          <View style={styles.bannerContainer}>
            {album.cover_photo_uri ? (
              <Image source={{ uri: album.cover_photo_uri }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderCover}>
                <Feather name="folder" size={48} color={theme.colors.border} />
              </View>
            )}

            <View style={styles.albumMetaBox}>
              {isRenaming ? (
                <View style={styles.renameRow}>
                  <TextInput
                    style={styles.renameInput}
                    value={albumName}
                    onChangeText={setAlbumName}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.renameSaveBtn} onPress={handleSaveRename}>
                    <Feather name="check" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.titleRow}>
                  <Text style={styles.albumTitle}>{albumName}</Text>
                  <TouchableOpacity onPress={() => setIsRenaming(true)} style={styles.editBtn}>
                    <Feather name="edit-2" size={14} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.albumSubtitle}>
                {items.length} {items.length === 1 ? 'Item' : 'Items'} • Updated{' '}
                {new Date(album.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Action Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.addPhotosBtn} onPress={handleAddPhotos} activeOpacity={0.8}>
              <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addPhotosBtnText}>Add Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
              activeOpacity={0.7}
            >
              <Feather name="bar-chart-2" size={14} color={theme.colors.text.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sortBtnText}>Sort: {sortBy === 'date' ? 'Date' : 'Name'}</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Grid */}
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="image" size={40} color={theme.colors.border} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>This album is empty</Text>
              <Text style={styles.emptySub}>Add photos from your gallery or camera roll to get started.</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {items.map((item) => (
                <View key={item.id} style={styles.gridItemWrapper}>
                  <TouchableOpacity
                    style={styles.photoItem}
                    onPress={() => setActivePhoto(item)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.photo_uri }} style={styles.photoThumb} />
                  </TouchableOpacity>

                  {/* Context quick action bar on photo */}
                  <View style={styles.itemActionOverlay}>
                    <TouchableOpacity
                      style={styles.miniActionBtn}
                      onPress={() => handleSetCover(item.photo_uri)}
                    >
                      <Feather name="star" size={11} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.miniActionBtn}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Feather name="x" size={11} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Photo Viewer */}
        <PhotoViewerModal
          visible={!!activePhoto}
          uri={activePhoto?.photo_uri || null}
          title={activePhoto?.title || album.name}
          date={activePhoto?.date || null}
          type={activePhoto?.item_type || 'photo'}
          onClose={() => setActivePhoto(null)}
          onDelete={
            activePhoto
              ? () => {
                  handleRemoveItem(activePhoto.id);
                  setActivePhoto(null);
                }
              : undefined
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.border,
  },
  placeholderCover: {
    width: '100%',
    height: 140,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  albumMetaBox: {
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
    marginRight: 8,
  },
  editBtn: {
    padding: 4,
  },
  albumSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  renameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 4,
  },
  renameSaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  addPhotosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.md,
  },
  addPhotosBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...theme.shadows.sm,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  gridItemWrapper: {
    width: itemSize,
    height: itemSize,
    position: 'relative',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  photoItem: {
    width: '100%',
    height: '100%',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  itemActionOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  miniActionBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

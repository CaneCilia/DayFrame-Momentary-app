import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { theme } from '../utils/theme';
import {
  Folder,
  Album,
  getFolders,
  getAlbums,
  createFolder,
  renameFolder,
  deleteFolder,
  createAlbum,
  moveAlbumToFolder
} from '../database/gallery';

interface FolderModalProps {
  folder: Folder | null;
  visible: boolean;
  onClose: () => void;
  onFolderUpdated: () => void;
  onOpenSubfolder: (subfolder: Folder) => void;
  onOpenAlbum: (album: Album) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  folder,
  visible,
  onClose,
  onFolderUpdated,
  onOpenSubfolder,
  onOpenAlbum,
}) => {
  const db = useSQLiteContext();
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [newSubfolderName, setNewSubfolderName] = useState('');
  const [showCreateSubfolder, setShowCreateSubfolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContents = useCallback(async () => {
    if (!folder) return;
    try {
      const [fetchedSubfolders, fetchedAlbums] = await Promise.all([
        getFolders(db, folder.id),
        getAlbums(db, folder.id),
      ]);
      setSubfolders(fetchedSubfolders);
      setAlbums(fetchedAlbums);
    } catch (e) {
      console.error('Failed to load folder contents:', e);
    }
  }, [db, folder]);

  useEffect(() => {
    if (visible && folder) {
      setFolderName(folder.name);
      setIsRenaming(false);
      setShowCreateSubfolder(false);
      loadContents();
    }
  }, [visible, folder, loadContents]);

  if (!folder) return null;

  const handleCreateSubfolder = async () => {
    if (!newSubfolderName.trim()) return;
    try {
      await createFolder(db, newSubfolderName.trim(), folder.id);
      setNewSubfolderName('');
      setShowCreateSubfolder(false);
      await loadContents();
      onFolderUpdated();
    } catch (e) {
      console.error('Create subfolder error:', e);
      Alert.alert('Error', 'Could not create subfolder.');
    }
  };

  const handleCreateAlbumInFolder = () => {
    Alert.prompt
      ? Alert.prompt('New Album', 'Enter a name for the new album:', async (name) => {
          if (name && name.trim()) {
            await createAlbum(db, name.trim(), null, folder.id);
            await loadContents();
            onFolderUpdated();
          }
        })
      : Alert.alert('Create Album', 'Please use the main gallery action bar to create an album.');
  };

  const handleSaveRename = async () => {
    if (!folderName.trim()) return;
    try {
      await renameFolder(db, folder.id, folderName.trim());
      setIsRenaming(false);
      onFolderUpdated();
    } catch (e) {
      console.error('Rename folder error:', e);
    }
  };

  const handleDeleteFolder = () => {
    Alert.alert(
      'Delete Folder',
      `Delete "${folder.name}"? Albums inside will be unassigned to the main gallery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(db, folder.id);
              onFolderUpdated();
              onClose();
            } catch (e) {
              console.error('Delete folder error:', e);
            }
          },
        },
      ]
    );
  };

  const filteredSubfolders = subfolders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAlbums = albums.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Feather name="chevron-left" size={26} color={theme.colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.topActions}>
            <TouchableOpacity onPress={handleDeleteFolder} style={styles.iconButton}>
              <Feather name="trash-2" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Folder Details Banner */}
          <View style={styles.folderBanner}>
            <View style={styles.folderIconBig}>
              <Feather name="folder" size={32} color={theme.colors.primary} />
            </View>

            {isRenaming ? (
              <View style={styles.renameRow}>
                <TextInput
                  style={styles.renameInput}
                  value={folderName}
                  onChangeText={setFolderName}
                  autoFocus
                />
                <TouchableOpacity style={styles.renameSaveBtn} onPress={handleSaveRename}>
                  <Feather name="check" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.titleRow}>
                <Text style={styles.folderTitle}>{folderName}</Text>
                <TouchableOpacity onPress={() => setIsRenaming(true)} style={styles.editBtn}>
                  <Feather name="edit-2" size={14} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.folderSubtitle}>
              {subfolders.length} Subfolders • {albums.length} Albums
            </Text>
          </View>

          {/* Search Across Folder */}
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search across this folder..."
              placeholderTextColor={theme.colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => setShowCreateSubfolder(!showCreateSubfolder)}
              activeOpacity={0.8}
            >
              <Feather name="folder-plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionPillText}>New Subfolder</Text>
            </TouchableOpacity>
          </View>

          {/* Create Subfolder Input Card */}
          {showCreateSubfolder && (
            <View style={styles.createCard}>
              <Text style={styles.createCardLabel}>CREATE NESTED SUBFOLDER</Text>
              <View style={styles.createInputRow}>
                <TextInput
                  style={styles.createInput}
                  placeholder="e.g. 2026 Trips, Projects, Family..."
                  placeholderTextColor={theme.colors.text.secondary}
                  value={newSubfolderName}
                  onChangeText={setNewSubfolderName}
                  autoFocus
                />
                <TouchableOpacity style={styles.createConfirmBtn} onPress={handleCreateSubfolder}>
                  <Text style={styles.createConfirmText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Nested Subfolders Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nested Folders</Text>
            <Text style={styles.sectionCount}>({filteredSubfolders.length})</Text>
          </View>

          {filteredSubfolders.length === 0 ? (
            <Text style={styles.emptyNote}>No subfolders inside this folder.</Text>
          ) : (
            <View style={styles.itemsList}>
              {filteredSubfolders.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.folderRow}
                  onPress={() => onOpenSubfolder(sub)}
                  activeOpacity={0.7}
                >
                  <View style={styles.folderThumbMini}>
                    <Feather name="folder" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.folderRowContent}>
                    <Text style={styles.folderRowName}>{sub.name}</Text>
                    <Text style={styles.folderRowMeta}>
                      {sub.subfolder_count || 0} folders • {sub.album_count || 0} albums
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Albums Inside This Folder */}
          <View style={[styles.sectionHeader, { marginTop: theme.spacing.xl }]}>
            <Text style={styles.sectionTitle}>Albums</Text>
            <Text style={styles.sectionCount}>({filteredAlbums.length})</Text>
          </View>

          {filteredAlbums.length === 0 ? (
            <Text style={styles.emptyNote}>No albums stored in this folder.</Text>
          ) : (
            <View style={styles.itemsList}>
              {filteredAlbums.map((alb) => (
                <TouchableOpacity
                  key={alb.id}
                  style={styles.folderRow}
                  onPress={() => onOpenAlbum(alb)}
                  activeOpacity={0.7}
                >
                  <View style={styles.albumThumbMini}>
                    <Feather name="grid" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.folderRowContent}>
                    <Text style={styles.folderRowName}>{alb.name}</Text>
                    <Text style={styles.folderRowMeta}>{alb.item_count || 0} photos</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
  },
  folderBanner: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  folderIconBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  editBtn: {
    marginLeft: 8,
    padding: 4,
  },
  folderSubtitle: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renameInput: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 4,
    minWidth: 150,
    textAlign: 'center',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  createCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  createCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  createInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  createConfirmBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: theme.borderRadius.md,
    marginLeft: 8,
  },
  createConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginLeft: 6,
  },
  emptyNote: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    paddingVertical: 12,
  },
  itemsList: {
    gap: 8,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.sm,
  },
  folderThumbMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  albumThumbMini: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderRowContent: {
    flex: 1,
  },
  folderRowName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  folderRowMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

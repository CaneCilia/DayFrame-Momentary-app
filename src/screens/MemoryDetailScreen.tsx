import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import * as Sharing from 'expo-sharing';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

let captureRef: any;
try {
  captureRef = require('react-native-view-shot').captureRef;
} catch (e) {
  console.log('react-native-view-shot is not available in Expo Go');
  captureRef = async () => {
    throw new Error('This feature requires an EAS Development Build.');
  };
}
import { useSQLiteContext } from 'expo-sqlite';
import { getMemoryById, Memory, toggleFavorite } from '../database/memories';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type MemoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoryDetail'>;

export const MemoryDetailScreen = () => {
  const route = useRoute<MemoryDetailScreenRouteProp>();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemory = async () => {
      try {
        const mem = await getMemoryById(db, route.params.memoryId);
        setMemory(mem);
      } catch (e) {
        console.error('Failed to load memory details:', e);
      } finally {
        setLoading(false);
      }
    };
    loadMemory();
  }, [db, route.params.memoryId]);

  const handleToggleFavorite = async () => {
    if (!memory) return;
    try {
      const newStatus = memory.is_favorite ? 0 : 1;
      await toggleFavorite(db, memory.id, newStatus);
      setMemory({ ...memory, is_favorite: newStatus });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Opening memory...</Text>
      </View>
    );
  }

  if (!memory) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Memory not found.</Text>
      </View>
    );
  }

  // Use local time when formatting string to avoid UTC shift issues
  const dateParts = memory.date.split('-');
  const formattedDate = new Date(
    parseInt(dateParts[0]), 
    parseInt(dateParts[1]) - 1, 
    parseInt(dateParts[2])
  ).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const polaroidRef = React.useRef<any>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const uri = await captureRef(polaroidRef, {
        format: 'png',
        quality: 1,
      });
      setPreviewImageUri(uri);
      setShareModalVisible(true);
    } catch (error: any) {
      console.error('Failed to generate polaroid:', error);
      Alert.alert('Error', 'Failed to generate share preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmShare = async () => {
    if (!previewImageUri) return;
    
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device');
        return;
      }
      
      await Sharing.shareAsync(previewImageUri, { dialogTitle: 'Share your memory' });
      setShareModalVisible(false);
    } catch (error: any) {
      console.error('Failed to share memory:', error);
      Alert.alert('Failed to share memory', error.message || 'An error occurred.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: memory.photoUri }} style={styles.image} />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.archivalTag}>Daily Visual Diary Entry</Text>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                onPress={handleToggleFavorite} 
                style={[styles.actionIconButton, memory.is_favorite ? styles.favoriteActiveBtn : null]}
                activeOpacity={0.7}
              >
                <Feather 
                  name="heart" 
                  size={18} 
                  color={memory.is_favorite ? theme.colors.accent : theme.colors.text.secondary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShare} 
                style={styles.shareButton} 
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <Feather name="share-2" size={14} color={theme.colors.text.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.shareText}>Export</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {memory.caption ? (
            <Text style={styles.captionText}>{memory.caption}</Text>
          ) : (
            <Text style={styles.noCaptionText}>A quiet moment without written caption.</Text>
          )}
        </View>
      </ScrollView>

      {/* Share Preview Modal */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Polaroid Export Preview</Text>
            
            {previewImageUri && (
              <View style={styles.previewImageWrapper}>
                <Image 
                  source={{ uri: previewImageUri }} 
                  style={styles.previewImage} 
                  resizeMode="contain" 
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShareModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmShareButton} 
                onPress={confirmShare}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmShareText}>Share Polaroid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Off-screen Polaroid View for Sharing */}
      <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <View ref={polaroidRef} style={styles.polaroidContainer}>
          <View style={styles.polaroidImageContainer}>
            <Image source={{ uri: memory.photoUri }} style={styles.polaroidImage} />
          </View>
          <Text style={styles.polaroidDate}>{formattedDate}</Text>
          {memory.caption && <Text style={styles.polaroidCaption} numberOfLines={2}>{memory.caption}</Text>}
          <Text style={styles.polaroidBranding}>DayFrame · Daily Visual Diary</Text>
        </View>
      </View>
    </View>
  );
};

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: theme.colors.background 
  },
  loadingText: { 
    color: theme.colors.text.secondary, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  errorText: { 
    color: theme.colors.error, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  content: { 
    paddingBottom: theme.spacing.xxl,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 20, 28, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: windowHeight * 0.60,
    backgroundColor: theme.colors.surface.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    minHeight: windowHeight * 0.40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.3,
  },
  archivalTag: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  favoriteActiveBtn: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shareText: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.md,
  },
  captionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 26,
    fontWeight: '400',
  },
  noCaptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },

  /* Polaroid Export View */
  polaroidContainer: {
    width: 1080,
    backgroundColor: '#FFFFFF',
    padding: 50,
    paddingBottom: 90,
  },
  polaroidImageContainer: {
    width: 980,
    height: 980,
    backgroundColor: '#F4F5F7',
    marginBottom: 44,
  },
  polaroidImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  polaroidDate: {
    fontSize: 44,
    fontWeight: '700',
    color: '#0F141C',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  polaroidCaption: {
    fontSize: 32,
    color: '#334155',
    lineHeight: 44,
    marginBottom: 24,
  },
  polaroidBranding: {
    fontSize: 22,
    color: '#64748B',
    textAlign: 'right',
    marginTop: 30,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 28, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  previewImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.xs,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  confirmShareButton: {
    flex: 2,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xs,
    alignItems: 'center',
  },
  confirmShareText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.inverse,
    letterSpacing: -0.2,
  },
});

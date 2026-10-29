import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  TextInput
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSQLiteContext } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { saveImageToLocal } from '../utils/fileSystem';
import { insertMemory, getMemoryByDate } from '../database/memories';
import { enqueueSyncOperation } from '../database/syncQueue';
import { useVideoPlayer, VideoView } from 'expo-video';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { CameraSettingsModal, CameraSettingsState } from '../components/CameraSettingsModal';

type CaptureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Capture'>;
type FlashState = 'off' | 'on' | 'auto';

const VideoPreview = ({ uri, style }: { uri: string; style: any }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="contain"
      nativeControls
    />
  );
};

export const CaptureScreen = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

  // Camera configuration states
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const [flash, setFlash] = useState<FlashState>('off');
  const [zoom, setZoom] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);

  // Settings modal state
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [cameraSettings, setCameraSettings] = useState<CameraSettingsState>({
    showGrid: false,
    timerDuration: 0,
    mirrorFrontCamera: true,
    highQuality: true,
  });

  // Media preview & saving states
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [caption, setCaption] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const cameraRef = useRef<CameraView>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigation = useNavigation<CaptureScreenNavigationProp>();
  const db = useSQLiteContext();

  const allPermissionsGranted =
    cameraPermission?.granted &&
    micPermission?.granted &&
    galleryPermission?.granted;

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Cycle flash mode: off -> on -> auto
  const toggleFlash = () => {
    if (flash === 'off') setFlash('on');
    else if (flash === 'on') setFlash('auto');
    else setFlash('off');
  };

  // Flip front / rear camera
  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Zoom preset selector
  const setZoomPreset = (val: number) => {
    setZoom(val);
  };

  // 1. Permission Setup Screen
  if (!allPermissionsGranted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.permissionCloseBtn}>
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.permissionScreenTitle}>Permissions & Access Setup</Text>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionCardDesc}>
            DayFrame requires access to your device capabilities to capture, store, and organize daily moments.
          </Text>

          {/* Camera Permission Item */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionItemIcon}>
              <Feather name="camera" size={20} color={cameraPermission?.granted ? '#34C759' : '#FFFFFF'} />
            </View>
            <View style={styles.permissionItemText}>
              <Text style={styles.permissionItemTitle}>Camera Access</Text>
              <Text style={styles.permissionItemSubtitle}>Required to capture daily photos and video memories.</Text>
            </View>
            <View style={[styles.statusBadge, cameraPermission?.granted && styles.statusBadgeGranted]}>
              <Text style={styles.statusBadgeText}>
                {cameraPermission?.granted ? 'Granted' : 'Needed'}
              </Text>
            </View>
          </View>

          {/* Microphone Permission Item */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionItemIcon}>
              <Feather name="mic" size={20} color={micPermission?.granted ? '#34C759' : '#FFFFFF'} />
            </View>
            <View style={styles.permissionItemText}>
              <Text style={styles.permissionItemTitle}>Microphone Access</Text>
              <Text style={styles.permissionItemSubtitle}>Required when recording video with synchronized audio.</Text>
            </View>
            <View style={[styles.statusBadge, micPermission?.granted && styles.statusBadgeGranted]}>
              <Text style={styles.statusBadgeText}>
                {micPermission?.granted ? 'Granted' : 'Needed'}
              </Text>
            </View>
          </View>

          {/* Photo/Media Access Item */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionItemIcon}>
              <Feather name="image" size={20} color={galleryPermission?.granted ? '#34C759' : '#FFFFFF'} />
            </View>
            <View style={styles.permissionItemText}>
              <Text style={styles.permissionItemTitle}>Photo / Media Library</Text>
              <Text style={styles.permissionItemSubtitle}>Required to select and save memories to your gallery.</Text>
            </View>
            <View style={[styles.statusBadge, galleryPermission?.granted && styles.statusBadgeGranted]}>
              <Text style={styles.statusBadgeText}>
                {galleryPermission?.granted ? 'Granted' : 'Needed'}
              </Text>
            </View>
          </View>

          {/* Storage Access Item */}
          <View style={styles.permissionItem}>
            <View style={styles.permissionItemIcon}>
              <Feather name="hard-drive" size={20} color="#34C759" />
            </View>
            <View style={styles.permissionItemText}>
              <Text style={styles.permissionItemTitle}>Local Storage Access</Text>
              <Text style={styles.permissionItemSubtitle}>Persistent SQLite and app directory storage ready.</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusBadgeGranted]}>
              <Text style={styles.statusBadgeText}>Active</Text>
            </View>
          </View>

          {/* Grant All Action Button */}
          <TouchableOpacity
            style={styles.grantButton}
            onPress={async () => {
              if (!cameraPermission?.granted) await requestCameraPermission();
              if (!micPermission?.granted) await requestMicPermission();
              if (!galleryPermission?.granted) await requestGalleryPermission();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.grantButtonText}>Grant All Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Photo capture logic
  const takePicture = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      if (cameraSettings.timerDuration > 0) {
        await new Promise((resolve) => setTimeout(resolve, cameraSettings.timerDuration * 1000));
      }
      const photo = await cameraRef.current.takePictureAsync({
        quality: cameraSettings.highQuality ? 1.0 : 0.8,
      });
      if (photo) {
        setMediaUri(photo.uri);
        setMediaType('photo');
      }
    } catch (e) {
      console.error('Failed to take picture:', e);
      Alert.alert('Capture Error', 'Could not capture photo. Please try again.');
    }
  };

  // 3. Video recording logic
  const toggleRecording = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    } else {
      try {
        setIsRecording(true);
        setRecordDuration(0);
        timerIntervalRef.current = setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);

        const video = await cameraRef.current.recordAsync({
          maxDuration: 60,
        });

        if (video) {
          setMediaUri(video.uri);
          setMediaType('video');
        }
      } catch (e) {
        console.error('Failed to record video:', e);
        Alert.alert('Recording Error', 'Could not record video.');
      } finally {
        setIsRecording(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      }
    }
  };

  const handleCaptureBtn = () => {
    if (mode === 'picture') {
      takePicture();
    } else {
      toggleRecording();
    }
  };

  // Gallery Picker
  const pickMediaFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(asset.type === 'video' ? 'video' : 'photo');
      }
    } catch (e) {
      console.error('Failed to pick media:', e);
    }
  };

  // Save confirmed media
  const confirmMedia = async () => {
    if (!mediaUri || isSaving) return;

    try {
      setIsSaving(true);
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - offset * 60 * 1000);
      const todayDate = localToday.toISOString().split('T')[0];

      const ext = mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `memory_${todayDate}_${Date.now()}.${ext}`;
      const localUri = await saveImageToLocal(mediaUri, filename);

      const memoryId = Crypto.randomUUID();
      await insertMemory(db, {
        id: memoryId,
        date: todayDate,
        photoUri: localUri,
        caption: caption.trim() || null,
        sync_status: 'PENDING',
        is_favorite: 0,
      });

      await enqueueSyncOperation(db, 'UPLOAD_PHOTO', memoryId, 'MEMORY');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save memory:', error);
      Alert.alert('Save Error', 'Failed to save your moment.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // 4. Preview and Retake Screen
  if (mediaUri) {
    return (
      <View style={styles.previewContainer}>
        {mediaType === 'video' ? (
          <VideoPreview uri={mediaUri} style={styles.previewMedia} />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="contain" />
        )}

        {/* Caption Input Overlay */}
        <View style={styles.previewBottomBar}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a thought or caption to this moment..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={caption}
            onChangeText={setCaption}
          />

          <View style={styles.previewButtonsRow}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setMediaUri(null);
                setCaption('');
              }}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveMemoryButton, isSaving && { opacity: 0.7 }]}
              onPress={confirmMedia}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveMemoryButtonText}>Save Memory</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 5. Active Camera Screen
  return (
    <View style={styles.cameraScreen}>
      <CameraView
        style={styles.cameraView}
        facing={facing}
        mode={mode}
        zoom={zoom}
        flash={flash}
        mirror={facing === 'front' && cameraSettings.mirrorFrontCamera}
        ref={cameraRef}
      />

      {/* Rule of Thirds Grid Overlay */}
      {cameraSettings.showGrid && (
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={[styles.gridLineVertical, { left: '33.33%' }]} />
          <View style={[styles.gridLineVertical, { left: '66.66%' }]} />
          <View style={[styles.gridLineHorizontal, { top: '33.33%' }]} />
          <View style={[styles.gridLineHorizontal, { top: '66.66%' }]} />
        </View>
      )}

      {/* Top Camera Controls Bar */}
      <View style={styles.topControlBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundIconBtn}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Live Recording Timer */}
        {isRecording && (
          <View style={styles.recordBadge}>
            <View style={styles.recordDot} />
            <Text style={styles.recordTimerText}>{formatTime(recordDuration)}</Text>
          </View>
        )}

        <View style={styles.topRightControls}>
          {/* Flash Mode Button (Off / On / Auto) */}
          <TouchableOpacity onPress={toggleFlash} style={styles.roundIconBtn}>
            <Feather
              name={flash === 'off' ? 'zap-off' : 'zap'}
              size={18}
              color={flash === 'off' ? '#FFFFFF' : '#FFD700'}
            />
            {flash === 'auto' && <Text style={styles.flashAutoBadge}>A</Text>}
          </TouchableOpacity>

          {/* Camera Settings Button */}
          <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.roundIconBtn}>
            <Feather name="settings" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Zoom Control Bar */}
      <View style={styles.zoomBar}>
        <TouchableOpacity
          style={[styles.zoomPill, zoom === 0 && styles.zoomPillActive]}
          onPress={() => setZoomPreset(0)}
        >
          <Text style={[styles.zoomPillText, zoom === 0 && styles.zoomPillTextActive]}>1x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomPill, zoom === 0.3 && styles.zoomPillActive]}
          onPress={() => setZoomPreset(0.3)}
        >
          <Text style={[styles.zoomPillText, zoom === 0.3 && styles.zoomPillTextActive]}>2x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomPill, zoom === 0.6 && styles.zoomPillActive]}
          onPress={() => setZoomPreset(0.6)}
        >
          <Text style={[styles.zoomPillText, zoom === 0.6 && styles.zoomPillTextActive]}>3x</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Camera Dock */}
      <View style={styles.bottomDock}>
        {/* Mode Switcher (PHOTO | VIDEO) */}
        <View style={styles.modeSwitchRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'picture' && styles.modeButtonActive]}
            onPress={() => !isRecording && setMode('picture')}
          >
            <Text style={[styles.modeButtonText, mode === 'picture' && styles.modeButtonTextActive]}>
              PHOTO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'video' && styles.modeButtonActive]}
            onPress={() => !isRecording && setMode('video')}
          >
            <Text style={[styles.modeButtonText, mode === 'video' && styles.modeButtonTextActive]}>
              VIDEO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shutter & Controls Row */}
        <View style={styles.shutterRow}>
          {/* Gallery Picker */}
          <TouchableOpacity
            style={styles.sideShutterBtn}
            onPress={pickMediaFromLibrary}
            disabled={isRecording}
          >
            <Feather name="image" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Shutter Capture Button */}
          <TouchableOpacity
            style={styles.shutterWrapper}
            onPress={handleCaptureBtn}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.shutterOuterRing,
                mode === 'video' && styles.shutterOuterRingVideo,
                isRecording && styles.shutterOuterRingRecording,
              ]}
            >
              <View
                style={[
                  styles.shutterInner,
                  mode === 'video' && styles.shutterInnerVideo,
                  isRecording && styles.shutterInnerRecording,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Switch Front / Rear Camera */}
          <TouchableOpacity
            style={styles.sideShutterBtn}
            onPress={toggleFacing}
            disabled={isRecording}
          >
            <Feather name="refresh-cw" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <CameraSettingsModal
        visible={isSettingsVisible}
        settings={cameraSettings}
        onUpdateSettings={(newVals) => setCameraSettings((prev) => ({ ...prev, ...newVals }))}
        onClose={() => setIsSettingsVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraView: {
    flex: 1,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: theme.spacing.lg,
  },
  permissionHeader: {
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  permissionCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionScreenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  permissionCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  permissionCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  permissionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionItemText: {
    flex: 1,
  },
  permissionItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  permissionItemSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statusBadgeGranted: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grantButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  grantButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  topControlBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  roundIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashAutoBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFD700',
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  recordTimerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  zoomBar: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.pill,
    padding: 3,
  },
  zoomPill: {
    width: 38,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomPillActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  zoomPillText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  zoomPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bottomDock: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: theme.borderRadius.pill,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modeButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  shutterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  sideShutterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterRingVideo: {
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  shutterOuterRingRecording: {
    borderColor: '#FF3B30',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  shutterInnerVideo: {
    backgroundColor: '#FF3B30',
  },
  shutterInnerRecording: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewMedia: {
    flex: 1,
  },
  previewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    paddingBottom: 36,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captionInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  saveMemoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
  },
  saveMemoryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

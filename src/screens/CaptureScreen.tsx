import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
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
import { Video, ResizeMode } from 'expo-av';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type CaptureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Capture'>;

export const CaptureScreen = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  
  const [mode, setMode] = useState<'picture' | 'video'>('picture');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [isSaving, setIsSaving] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<CaptureScreenNavigationProp>();
  const db = useSQLiteContext();

  const allPermissionsGranted = 
    cameraPermission?.granted && 
    micPermission?.granted && 
    galleryPermission?.granted;

  if (!cameraPermission || !micPermission || !galleryPermission) {
    return <View style={styles.container} />;
  }

  if (!allPermissionsGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Allow Access</Text>
        <Text style={styles.permissionText}>DayFrame needs access to your camera, microphone, and gallery to capture your memories.</Text>
        
        <TouchableOpacity 
          style={styles.permissionBtn}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
            await requestGalleryPermission();
          }}
        >
          <Text style={styles.permissionBtnText}>Grant Permissions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#888' }}>Not Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setMediaUri(photo.uri);
          setMediaType('photo');
        }
      } catch (e) {
        console.error('Failed to take picture:', e);
      }
    }
  };

  const toggleRecording = async () => {
    if (!cameraRef.current) return;
    
    if (isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60, // 1 minute max for daily memories
        });
        if (video) {
          setMediaUri(video.uri);
          setMediaType('video');
        }
      } catch (e) {
        console.error('Failed to record video:', e);
        setIsRecording(false);
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

  const pickImage = async () => {
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

  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const confirmMedia = async () => {
    if (!mediaUri || isSaving) return;

    try {
      setIsSaving(true);
      const todayDate = getTodayDateString();

      const existingMemory = await getMemoryByDate(db, todayDate);
      if (existingMemory) {
        Alert.alert('Limit Reached', 'You have already captured your moment for today!');
        setIsSaving(false);
        return;
      }

      const ext = mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `memory_${todayDate}_${Date.now()}.${ext}`;
      const localUri = await saveImageToLocal(mediaUri, filename);

      const memoryId = Crypto.randomUUID();
      await insertMemory(db, {
        id: memoryId,
        date: todayDate,
        photoUri: localUri,
        caption: null,
        sync_status: 'PENDING',
      });

      await enqueueSyncOperation(db, 'UPLOAD_PHOTO', memoryId, 'MEMORY');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save memory:', error);
      Alert.alert('Error', 'Failed to save your moment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const retakeMedia = () => {
    if (!isSaving) {
      setMediaUri(null);
    }
  };

  if (mediaUri) {
    return (
      <View style={styles.container}>
        {mediaType === 'video' ? (
          <Video
            source={{ uri: mediaUri }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
          />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.preview} />
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={retakeMedia} disabled={isSaving}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmMedia} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Save Memory</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back" 
        mode={mode} 
        ref={cameraRef} 
      />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.modeSwitcher}>
          <TouchableOpacity 
            style={[styles.modeTab, mode === 'picture' && styles.modeTabActive]} 
            onPress={() => setMode('picture')}
          >
            <Text style={[styles.modeText, mode === 'picture' && styles.modeTextActive]}>PHOTO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeTab, mode === 'video' && styles.modeTabActive]} 
            onPress={() => setMode('video')}
          >
            <Text style={[styles.modeText, mode === 'video' && styles.modeTextActive]}>VIDEO</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Feather name="image" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.captureButtonWrapper} onPress={handleCaptureBtn}>
          <View style={[
            styles.captureButtonOuter, 
            mode === 'video' && isRecording && styles.recordingOuter
          ]}>
            <View style={[
              styles.captureButtonInner,
              mode === 'video' && styles.captureButtonVideo,
              isRecording && styles.captureButtonRecording
            ]} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 10,
  },
  permissionText: {
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  modeTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: '#333',
  },
  modeText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#FFF',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  captureButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingOuter: {
    borderColor: '#FF3B30',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
  },
  captureButtonVideo: {
    backgroundColor: '#FF3B30',
  },
  captureButtonRecording: {
    borderRadius: 10,
    width: 30,
    height: 30,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
  },
  placeholder: {
    width: 50,
  },
  preview: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 30,
    backgroundColor: '#000',
    paddingBottom: 50,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#333',
    minWidth: 140,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});

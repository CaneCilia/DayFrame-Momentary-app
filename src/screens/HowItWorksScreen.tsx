import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HowItWorksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HowItWorks'>;

const { height, width } = Dimensions.get('window');

interface WalkthroughStep {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  image: string;
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 1,
    badge: '01 / DAILY MOMENT',
    title: 'One Frame. Every Day.',
    subtitle: 'Build an authentic, unedited timeline of your life.',
    description: 'Capture a single photo or video moment each day. No filters, no social pressure — just intentional reflection.',
    icon: 'camera',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    badge: '02 / VISUAL TIMELINE',
    title: 'Interactive Time Tracks',
    subtitle: 'See your months and years unfold visually.',
    description: 'Pan across horizontal time axes with dynamic zoom levels by Day, Week, Month, and Year. Track duration, milestones, and events.',
    icon: 'bar-chart-2',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    badge: '03 / GALLERY & ALBUMS',
    title: 'Organized Media Vault',
    subtitle: 'Sort, group, and curate your memories.',
    description: 'Create dedicated albums, organize nested folders, and quickly filter by favorites, photos, and videos with one tap.',
    icon: 'grid',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    badge: '04 / PRIVATE & SECURE',
    title: 'Local-First Architecture',
    subtitle: 'Your memories belong exclusively to you.',
    description: 'Data is stored locally on your device in a high-performance SQLite database, with optional encrypted cloud backup.',
    icon: 'shield',
    image: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1200&auto=format&fit=crop',
  },
];

export const HowItWorksScreen = ({ navigation }: { navigation: HowItWorksScreenNavigationProp }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = WALKTHROUGH_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === WALKTHROUGH_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigation.navigate('ReminderSetup');
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    navigation.navigate('ReminderSetup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: step.image }} style={styles.backgroundImage} resizeMode="cover">
        {/* Controlled single gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.92)']}
          style={styles.gradient}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar with Step Indicators and Skip */}
          <View style={styles.topBar}>
            <View style={styles.progressRow}>
              {WALKTHROUGH_STEPS.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <View
                    key={s.id}
                    style={[
                      styles.indicatorBar,
                      isActive && styles.indicatorBarActive,
                      isPassed && styles.indicatorBarPassed,
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentBody}>
            {/* Badge */}
            <View style={styles.badgePill}>
              <Feather name={step.icon} size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.badgePillText}>{step.badge}</Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {/* Detailed Description */}
            <View style={styles.descCard}>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>

          {/* Bottom Navigation Controls */}
          <View style={styles.footerControls}>
            {currentStepIndex > 0 ? (
              <TouchableOpacity onPress={handlePrev} style={styles.backButton} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Complete Walkthrough' : 'Next'}
              </Text>
              <Feather
                name={isLastStep ? 'check' : 'arrow-right'}
                size={18}
                color="#000000"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 20,
  },
  indicatorBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  indicatorBarActive: {
    backgroundColor: '#FFFFFF',
    height: 4,
  },
  indicatorBarPassed: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  contentBody: {
    paddingBottom: 20,
  },
  badgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E5E5EA',
    lineHeight: 24,
    marginBottom: 16,
  },
  descCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    fontWeight: '400',
  },
  footerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 0,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: theme.borderRadius.pill,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});

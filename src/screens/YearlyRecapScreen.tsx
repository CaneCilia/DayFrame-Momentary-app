import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, SafeAreaView, Animated, TouchableWithoutFeedback } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Memory } from '../database/memories';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

type YearlyRecapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'YearlyRecap'>;

const STORY_DURATION = 5000; // 5 seconds per story

export const YearlyRecapScreen = ({ navigation }: { navigation: YearlyRecapScreenNavigationProp }) => {
  const db = useSQLiteContext();
  const [recapMemories, setRecapMemories] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentYear = new Date().getFullYear();
  
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRecap = async () => {
      const all = await db.getAllAsync<Memory>(
        'SELECT * FROM memories WHERE date LIKE ? ORDER BY date ASC',
        [`${currentYear}-%`]
      );
      
      const monthlyPicks: Record<string, Memory> = {};
      all.forEach(m => {
        const month = m.date.split('-')[1];
        if (!monthlyPicks[month]) {
          monthlyPicks[month] = m;
        }
      });
      
      setRecapMemories(Object.values(monthlyPicks));
    };
    fetchRecap();
  }, [db, currentYear]);

  useEffect(() => {
    if (recapMemories.length > 0) {
      startStoryAnim();
    }
    return () => {
      progressAnim.stopAnimation();
    };
  }, [currentIndex, recapMemories]);

  const startStoryAnim = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  };

  const goToNext = () => {
    if (currentIndex < recapMemories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigation.goBack(); // End of recap
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      progressAnim.setValue(0);
      startStoryAnim(); // Restart current if it's the first one
    }
  };

  const handlePress = (evt: any) => {
    const { locationX } = evt.nativeEvent;
    if (locationX < width / 3) {
      goToPrev();
    } else {
      goToNext();
    }
  };

  if (recapMemories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Building your {currentYear} story...</Text>
          <Text style={styles.emptySubText}>Add more memories to see your recap.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentMemory = recapMemories[currentIndex];
  const monthName = new Date(currentMemory.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {recapMemories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFg,
                {
                  width: index === currentIndex 
                    ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                    : index < currentIndex ? '100%' : '0%'
                }
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.header}>
        <View style={styles.musicTag}>
          <Text style={styles.musicIcon}>🎵</Text>
          <Text style={styles.musicText}>{currentYear} in Review Mix</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.storyContainer}>
          <Image source={{ uri: currentMemory.photoUri }} style={styles.storyImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
            style={styles.overlayGradient}
          >
            <View style={styles.textContainer}>
              <Text style={styles.monthTag}>{monthName.toUpperCase()}</Text>
              <Text style={styles.captionText}>
                {currentMemory.caption || "A moment to remember"}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    position: 'absolute',
    top: 40,
    zIndex: 20,
    width: '100%',
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFg: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    position: 'absolute',
    top: 55,
    zIndex: 10,
    width: '100%',
  },
  musicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  musicIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  musicText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  closeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storyContainer: {
    width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  monthTag: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  captionText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#AAA',
    fontSize: 16,
  }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HowItWorksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HowItWorks'>;

const { height } = Dimensions.get('window');

export const HowItWorksScreen = ({ navigation }: { navigation: HowItWorksScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>How it Works</Text>
            <Text style={styles.subtitle}>Three simple rules to build a lifetime of memories.</Text>
          </View>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepIconWrapper}>
                <Feather name="camera" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Capture Once a Day</Text>
                <Text style={styles.stepDesc}>Take exactly one photo every day. Focus on the moment, not the perfect shot.</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIconWrapper}>
                <Feather name="lock" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>100% Private</Text>
                <Text style={styles.stepDesc}>Your data is stored locally on your device first. You are in complete control.</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIconWrapper}>
                <Feather name="cloud" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Secure Cloud Backup</Text>
                <Text style={styles.stepDesc}>Seamlessly sync your memories to your secure cloud so you never lose them.</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('ReminderSetup')}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
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
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 50,
  },
  title: { 
    fontSize: 40, 
    fontWeight: '800', 
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    lineHeight: 26,
    fontWeight: '500',
  },
  stepsContainer: { 
    flex: 1, 
  },
  step: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 40,
  },
  stepIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 8,
  },
  stepDesc: { 
    fontSize: 15, 
    color: '#A1A1A6',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
  },
  button: { 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: '800' 
  }
});

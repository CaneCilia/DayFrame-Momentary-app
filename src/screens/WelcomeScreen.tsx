import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { height } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: { navigation: WelcomeScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />
        
        <View style={styles.content}>
          <View style={styles.topSection}>
            <View style={styles.featurePill}>
              <Feather name="shield" size={12} color="#E5E5EA" style={{ marginRight: 6 }} />
              <Text style={styles.featurePillText}>Secure & Local-First</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.logo}>DayFrame</Text>
            <Text style={styles.tagline}>Your life, captured one intentional frame at a time.</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('HowItWorks')}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Start the Journey</Text>
              <Feather name="arrow-right" size={20} color={theme.colors.primary} />
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
    bottom: 0,
    height: height * 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: 50,
  },
  topSection: {
    alignItems: 'center',
  },
  bottomSection: {
    width: '100%',
  },
  logo: { 
    fontSize: 48, 
    fontWeight: '800', 
    marginBottom: theme.spacing.sm, 
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  tagline: { 
    fontSize: 18, 
    color: '#CCCCCC', 
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 40,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  featurePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  button: { 
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: '800',
    marginRight: 8,
  }
});

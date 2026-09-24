import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: { navigation: WelcomeScreenNavigationProp }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Feather name="aperture" size={48} color={theme.colors.text.inverse} />
          </View>
          <Text style={styles.logo}>DayFrame</Text>
          <Text style={styles.tagline}>Your life, one frame at a time.</Text>
          
          <View style={styles.featurePill}>
            <Text style={styles.featurePillText}>Secure. Private. Local-First.</Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('HowItWorks')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Start the Journey</Text>
            <Feather name="arrow-right" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0C', // Deep premium dark background
  },
  container: { 
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconWrapper: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logo: { 
    fontSize: 48, 
    fontWeight: '800', 
    marginBottom: theme.spacing.md, 
    color: theme.colors.text.inverse,
    letterSpacing: -1.5,
  },
  tagline: { 
    fontSize: 20, 
    color: '#8E8E93', 
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 28,
    marginBottom: theme.spacing.xxl,
  },
  featurePill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featurePillText: {
    color: '#E5E5EA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionContainer: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  button: { 
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.card, 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
    ...theme.shadows.md,
  },
  buttonText: { 
    color: theme.colors.primary, 
    fontSize: 16, 
    fontWeight: '800',
    marginRight: 8,
  }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: { navigation: WelcomeScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>DayFrame</Text>
        <Text style={styles.tagline}>One photo. Every day.</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('HowItWorks')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { 
    fontSize: 42, 
    fontWeight: '800', 
    marginBottom: theme.spacing.md, 
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  tagline: { 
    fontSize: 20, 
    color: theme.colors.text.secondary, 
    textAlign: 'center',
    fontWeight: '500',
  },
  button: { 
    backgroundColor: theme.colors.primary, 
    paddingVertical: theme.spacing.lg, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  buttonText: { 
    color: theme.colors.text.inverse, 
    fontSize: 18, 
    fontWeight: '600' 
  }
});

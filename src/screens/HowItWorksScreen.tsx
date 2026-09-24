import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type HowItWorksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HowItWorks'>;

export const HowItWorksScreen = ({ navigation }: { navigation: HowItWorksScreenNavigationProp }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How it Works</Text>
          <Text style={styles.subtitle}>Three simple rules to build a lifetime of memories.</Text>
        </View>
        
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepIconWrapper}>
              <Feather name="camera" size={24} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Capture Once a Day</Text>
              <Text style={styles.stepDesc}>Take exactly one photo every day. Focus on the moment, not the perfect shot.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIconWrapper}>
              <Feather name="lock" size={24} color={theme.colors.text.inverse} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>100% Private</Text>
              <Text style={styles.stepDesc}>Your data is stored locally on your device first. You are in complete control.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIconWrapper}>
              <Feather name="cloud" size={24} color={theme.colors.text.inverse} />
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
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0C', // Match Welcome Screen
  },
  container: { 
    flex: 1, 
    padding: theme.spacing.lg, 
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: theme.colors.text.inverse,
    letterSpacing: -1,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
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
    color: theme.colors.text.inverse, 
    marginBottom: 8,
  },
  stepDesc: { 
    fontSize: 15, 
    color: '#8E8E93',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  button: { 
    backgroundColor: theme.colors.card, 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonText: { 
    color: theme.colors.primary, 
    fontSize: 16, 
    fontWeight: '800' 
  }
});

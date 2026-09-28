import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../services/notifications';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ReminderSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReminderSetup'>;

const { height } = Dimensions.get('window');

export const ReminderSetupScreen = ({ navigation }: { navigation: ReminderSetupScreenNavigationProp }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const toggleSwitch = async (newValue: boolean) => {
    if (newValue) {
      setIsRequesting(true);
      const granted = await requestNotificationPermissions();
      setIsRequesting(false);
      
      if (granted) {
        setIsEnabled(true);
        // Default to 8 PM (20:00)
        await scheduleDailyReminder(20, 0);
      } else {
        Alert.alert('Permission Denied', 'You need to enable notifications in your settings.');
        setIsEnabled(false);
      }
    } else {
      setIsEnabled(false);
      await cancelAllReminders();
    }
  };

  const handleContinue = () => {
    navigation.navigate('SetupComplete');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Feather name="bell" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Never Miss a Day</Text>
            <Text style={styles.subtitle}>Consistency is key. Get a gentle nudge at 8:00 PM to capture your daily memory.</Text>
          </View>
          
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Notifications</Text>
              <Text style={styles.settingDesc}>Receive a push notification at 8:00 PM</Text>
            </View>
            <Switch
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FFFFFF' }}
              thumbColor={isEnabled ? '#000000' : '#FFFFFF'}
              onValueChange={toggleSwitch}
              value={isEnabled}
              disabled={isRequesting}
            />
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.button, isEnabled ? styles.buttonActive : styles.buttonInactive]}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <Text style={[styles.buttonText, isEnabled ? styles.buttonTextActive : styles.buttonTextInactive]}>
                {isEnabled ? 'Save and Continue' : 'Skip for now'}
              </Text>
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
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
  settingCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: theme.spacing.lg, 
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  settingLabel: { 
    fontSize: 18, 
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: '#A1A1A6',
    fontWeight: '500',
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: { 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonActive: {
    backgroundColor: '#FFFFFF', 
  },
  buttonInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: '800' 
  },
  buttonTextActive: {
    color: '#000000',
  },
  buttonTextInactive: {
    color: '#FFFFFF',
  }
});

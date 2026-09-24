import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../services/notifications';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type ReminderSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReminderSetup'>;

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Feather name="bell" size={32} color={theme.colors.text.inverse} />
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
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.card }}
            thumbColor={'#fff'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            disabled={isRequesting}
          />
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>{isEnabled ? 'Save and Continue' : 'Skip for now'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  container: { 
    flex: 1, 
    padding: theme.spacing.lg, 
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
  settingCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: theme.spacing.lg, 
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  settingInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  settingLabel: { 
    fontSize: 18, 
    color: theme.colors.text.inverse,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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

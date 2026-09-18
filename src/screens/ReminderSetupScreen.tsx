import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../services/notifications';

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
    <View style={styles.container}>
      <Text style={styles.title}>Reminder Setup</Text>
      <Text style={styles.subtitle}>Get a gentle nudge so you never miss a day. By default, we will remind you at 8:00 PM.</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Enable daily reminder</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={'#fff'}
          onValueChange={toggleSwitch}
          value={isEnabled}
          disabled={isRequesting}
        />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>{isEnabled ? 'Save and Continue' : 'Skip for now'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 15, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, lineHeight: 24 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  settingLabel: { fontSize: 18, color: '#333' },
  button: { backgroundColor: '#000', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', position: 'absolute', bottom: 50, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

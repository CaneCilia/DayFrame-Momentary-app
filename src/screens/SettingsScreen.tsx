import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Signed out', 'You have been signed out successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Sync</Text>
        {user ? (
          <View>
            <Text style={styles.userInfo}>Logged in as: {user.email}</Text>
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.placeholder}>Sign in to sync your memories across devices.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.buttonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={styles.placeholder}>More settings coming soon in Phase 4!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 30, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  userInfo: { fontSize: 16, marginBottom: 15 },
  placeholder: { fontSize: 16, color: '#666', marginBottom: 15 },
  button: { backgroundColor: '#000', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SetupCompleteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetupComplete'>;

export const SetupCompleteScreen = ({ navigation }: { navigation: SetupCompleteScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.checkIcon}>✓</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>Your local vault is ready. Start building your timeline.</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.buttonText}>Capture Today's Moment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkIcon: { fontSize: 80, color: '#007AFF', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 15, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', position: 'absolute', bottom: 50, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

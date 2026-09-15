import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: { navigation: WelcomeScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DayFrame</Text>
      <Text style={styles.tagline}>One photo. Every day.</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('HowItWorks')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  logo: { fontSize: 36, fontWeight: '800', marginBottom: 10, color: '#333' },
  tagline: { fontSize: 18, color: '#666', marginBottom: 60, textAlign: 'center' },
  button: { backgroundColor: '#000', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', position: 'absolute', bottom: 50 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

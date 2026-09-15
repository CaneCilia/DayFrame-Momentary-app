import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HowItWorksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HowItWorks'>;

export const HowItWorksScreen = ({ navigation }: { navigation: HowItWorksScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How DayFrame Works</Text>
      
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <View>
            <Text style={styles.stepTitle}>Capture</Text>
            <Text style={styles.stepDesc}>One photo every day</Text>
          </View>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <View>
            <Text style={styles.stepTitle}>Save</Text>
            <Text style={styles.stepDesc}>No social feed</Text>
          </View>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <View>
            <Text style={styles.stepTitle}>Remember</Text>
            <Text style={styles.stepDesc}>Your personal timeline</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('ReminderSetup')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 40, color: '#333' },
  stepsContainer: { flex: 1 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  stepNumber: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', textAlign: 'center', lineHeight: 50, fontSize: 20, fontWeight: '700', marginRight: 20, overflow: 'hidden' },
  stepTitle: { fontSize: 22, fontWeight: '600', color: '#333', marginBottom: 5 },
  stepDesc: { fontSize: 16, color: '#666' },
  button: { backgroundColor: '#000', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, width: '100%', alignItems: 'center', position: 'absolute', bottom: 50, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});

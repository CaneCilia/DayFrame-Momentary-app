import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

type HowItWorksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HowItWorks'>;

export const HowItWorksScreen = ({ navigation }: { navigation: HowItWorksScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How DayFrame Works</Text>
      
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Capture</Text>
            <Text style={styles.stepDesc}>One photo every day</Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Save</Text>
            <Text style={styles.stepDesc}>No social feed</Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>Remember</Text>
            <Text style={styles.stepDesc}>Your personal timeline</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('ReminderSetup')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    padding: theme.spacing.lg, 
    paddingTop: theme.spacing.xxl 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginBottom: 40, 
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  stepsContainer: { flex: 1, marginTop: theme.spacing.lg },
  step: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 40 
  },
  stepNumberContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    ...theme.shadows.sm,
  },
  stepNumber: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: theme.colors.primary,
  },
  stepTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: theme.colors.text.primary, 
    marginBottom: 4 
  },
  stepDesc: { 
    fontSize: 16, 
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  button: { 
    backgroundColor: theme.colors.primary, 
    paddingHorizontal: 40, 
    paddingVertical: theme.spacing.lg, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: theme.spacing.xl, 
    alignSelf: 'center',
    ...theme.shadows.md,
  },
  buttonText: { 
    color: theme.colors.text.inverse, 
    fontSize: 18, 
    fontWeight: '600' 
  }
});

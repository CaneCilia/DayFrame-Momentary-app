import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Onboarding Screen</Text>
      <Text>One photo. Every day.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

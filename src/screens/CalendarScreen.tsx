import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CalendarScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Calendar Screen</Text>
      <Text>Monthly visual overview</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

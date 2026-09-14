import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TimelineScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Timeline Screen</Text>
      <Text>Scroll through past memories</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

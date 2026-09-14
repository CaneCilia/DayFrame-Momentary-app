import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MemoryDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Memory Detail Screen</Text>
      <Text>Full photo view</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

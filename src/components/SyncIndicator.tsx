import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

export const SyncIndicator = () => {
  const { status, pendingCount } = useSyncStatus();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'SYNCING') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [status, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  if (status === 'NO_ACCOUNT') return null;

  let iconName: keyof typeof Feather.glyphMap = 'cloud';
  let color = theme.colors.text.secondary;

  if (status === 'SYNCED') {
    iconName = 'cloud-drizzle'; // Or just cloud with success color
    color = theme.colors.success;
  } else if (status === 'OFFLINE_PENDING') {
    iconName = 'cloud-off';
    color = theme.colors.accent;
  } else if (status === 'SYNCING') {
    iconName = 'refresh-cw';
    color = theme.colors.primary;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={status === 'SYNCING' && { transform: [{ rotate: spin }] }}>
        <Feather name={iconName} size={14} color={color} />
      </Animated.View>
      {pendingCount > 0 && status !== 'SYNCING' && (
        <Text style={styles.countText}>{pendingCount}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.accent,
    marginLeft: 6,
  }
});

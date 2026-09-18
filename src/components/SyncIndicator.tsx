import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { theme } from '../utils/theme';

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

  let icon = '☁️';
  let color = theme.colors.text.secondary;

  if (status === 'SYNCED') {
    icon = '☁️✓';
    color = theme.colors.success;
  } else if (status === 'OFFLINE_PENDING') {
    icon = '☁️⚠';
    color = theme.colors.accent;
  } else if (status === 'SYNCING') {
    icon = '↻';
    color = theme.colors.primary;
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.icon, status === 'SYNCING' && { transform: [{ rotate: spin }] }]}>
        {icon}
      </Animated.Text>
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
    marginLeft: theme.spacing.sm,
  },
  icon: {
    fontSize: 14,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginLeft: 4,
  }
});

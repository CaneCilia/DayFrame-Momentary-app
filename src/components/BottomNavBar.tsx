import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';

export type NavTab = 'Home' | 'Calendar' | 'Gallery' | 'Timeline';

interface BottomNavBarProps {
  currentTab: NavTab;
}

interface TabConfig {
  key: NavTab;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabConfig[] = [
  { key: 'Home', label: 'Today', icon: 'disc' },
  { key: 'Calendar', label: 'Calendar', icon: 'calendar' },
  { key: 'Gallery', label: 'Gallery', icon: 'image' },
  { key: 'Timeline', label: 'Memories', icon: 'grid' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = (tab: NavTab) => {
    if (tab === currentTab) return;
    navigation.navigate(tab);
  };

  return (
    <View style={styles.navBar}>
      {TABS.map((tab) => {
        const isActive = tab.key === currentTab;
        const iconColor = isActive ? theme.colors.primary : theme.colors.text.secondary;
        const textColor = isActive ? theme.colors.accent : theme.colors.text.secondary;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Feather name={tab.icon} size={20} color={iconColor} />
              {isActive && <View style={styles.activeIndicator} />}
            </View>
            <Text style={[styles.navText, { color: textColor, fontWeight: isActive ? '600' : '400' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative',
    height: 24,
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.accent,
  },
  navText: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: -0.2,
  },
});

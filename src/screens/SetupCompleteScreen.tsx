import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

type SetupCompleteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetupComplete'>;

export const SetupCompleteScreen = ({ navigation }: { navigation: SetupCompleteScreenNavigationProp }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconWrapper}>
            <Feather name="check" size={48} color={theme.colors.card} />
          </View>
          <Text style={styles.title}>You're All Set</Text>
          <Text style={styles.subtitle}>Your local vault is configured. It's time to start building your legacy, one frame at a time.</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.replace('Home')}
            activeOpacity={0.8}
          >
            <Feather name="camera" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Capture Today's Moment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  container: { 
    flex: 1, 
    padding: theme.spacing.lg 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { 
    fontSize: 40, 
    fontWeight: '800', 
    marginBottom: theme.spacing.md, 
    color: theme.colors.text.inverse, 
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: { 
    fontSize: 18, 
    color: '#8E8E93', 
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  button: { 
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.card, 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonText: { 
    color: theme.colors.primary, 
    fontSize: 16, 
    fontWeight: '800' 
  }
});

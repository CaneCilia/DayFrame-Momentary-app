import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type SetupCompleteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SetupComplete'>;

const { height } = Dimensions.get('window');

export const SetupCompleteScreen = ({ navigation }: { navigation: SetupCompleteScreenNavigationProp }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />
        
        <View style={styles.content}>
          <View style={styles.centerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="check" size={48} color="#000000" />
            </View>
            <Text style={styles.title}>You're All Set</Text>
            <Text style={styles.subtitle}>Your local vault is configured. It's time to start building your legacy, one frame at a time.</Text>
          </View>
          
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.replace('Home')}
              activeOpacity={0.9}
            >
              <Feather name="camera" size={20} color="#000000" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Capture Today's Moment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.7,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 60,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { 
    fontSize: 48, 
    fontWeight: '800', 
    marginBottom: theme.spacing.md, 
    color: '#FFFFFF', 
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  subtitle: { 
    fontSize: 18, 
    color: '#CCCCCC', 
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
  },
  button: { 
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    paddingVertical: 18, 
    borderRadius: theme.borderRadius.pill, 
    width: '100%', 
    alignItems: 'center', 
  },
  buttonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: '800' 
  }
});

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { HomeScreen } from '../screens/HomeScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { MemoryDetailScreen } from '../screens/MemoryDetailScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { HowItWorksScreen } from '../screens/HowItWorksScreen';
import { ReminderSetupScreen } from '../screens/ReminderSetupScreen';
import { SetupCompleteScreen } from '../screens/SetupCompleteScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CaptureScreen } from '../screens/CaptureScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { StorageScreen } from '../screens/StorageScreen';
import { YearlyRecapScreen } from '../screens/YearlyRecapScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { theme } from '../utils/theme';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  HowItWorks: undefined;
  ReminderSetup: undefined;
  SetupComplete: undefined;
  Settings: undefined;
  Profile: undefined;
  Home: undefined;
  Capture: undefined;
  Timeline: undefined;
  Calendar: undefined;
  Gallery: undefined;
  MemoryDetail: { memoryId: string };
  Auth: undefined;
  Search: undefined;
  Privacy: undefined;
  Storage: undefined;
  YearlyRecap: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
        />
        <Stack.Screen 
          name="HowItWorks" 
          component={HowItWorksScreen} 
        />
        <Stack.Screen 
          name="ReminderSetup" 
          component={ReminderSetupScreen} 
        />
        <Stack.Screen 
          name="SetupComplete" 
          component={SetupCompleteScreen} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Capture" 
          component={CaptureScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="Timeline" 
          component={TimelineScreen} 
        />
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen} 
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen} 
        />
        <Stack.Screen 
          name="MemoryDetail" 
          component={MemoryDetailScreen} 
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen} 
        />
        <Stack.Screen 
          name="Storage" 
          component={StorageScreen} 
        />
        <Stack.Screen 
          name="YearlyRecap" 
          component={YearlyRecapScreen} 
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

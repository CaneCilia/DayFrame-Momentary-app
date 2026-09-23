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
import { CaptureScreen } from '../screens/CaptureScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { StorageScreen } from '../screens/StorageScreen';
import { YearlyRecapScreen } from '../screens/YearlyRecapScreen';

// Define navigation types
export type RootStackParamList = {
  Welcome: undefined;
  HowItWorks: undefined;
  ReminderSetup: undefined;
  SetupComplete: undefined;
  Settings: undefined;
  Home: undefined;
  Capture: undefined;
  Timeline: undefined;
  Calendar: undefined;
  MemoryDetail: { memoryId: string }; // Example parameter
  Auth: undefined;
  Search: undefined;
  Privacy: undefined;
  Storage: undefined;
  YearlyRecap: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="HowItWorks" 
          component={HowItWorksScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ReminderSetup" 
          component={ReminderSetupScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SetupComplete" 
          component={SetupCompleteScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Today' }}
        />
        <Stack.Screen 
          name="Capture" 
          component={CaptureScreen} 
          options={{ title: 'Capture Moment', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="Timeline" 
          component={TimelineScreen} 
          options={{ title: 'Your Journey' }}
        />
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen} 
          options={{ title: 'Calendar' }}
        />
        <Stack.Screen 
          name="MemoryDetail" 
          component={MemoryDetailScreen} 
          options={{ title: 'Memory' }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ title: 'Cloud Sync', presentation: 'modal' }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'Search Memories' }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen} 
          options={{ title: 'Privacy Hub' }}
        />
        <Stack.Screen 
          name="Storage" 
          component={StorageScreen} 
          options={{ title: 'Storage & Data' }}
        />
        <Stack.Screen 
          name="YearlyRecap" 
          component={YearlyRecapScreen} 
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

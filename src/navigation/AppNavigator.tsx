import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { MemoryDetailScreen } from '../screens/MemoryDetailScreen';

import { CaptureScreen } from '../screens/CaptureScreen';

// Define navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Capture: undefined;
  Timeline: undefined;
  Calendar: undefined;
  MemoryDetail: { memoryId: string }; // Example parameter
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

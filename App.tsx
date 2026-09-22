import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';

// Ignore expected warnings in Expo Go
LogBox.ignoreLogs([
  'Google Signin native module is not available',
  '`Background Fetch` functionality is not available in Expo Go'
]);
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/db';
import { AuthProvider } from './src/contexts/AuthContext';
import { registerBackgroundSync } from './src/services/syncWorker';

export default function App() {
  useEffect(() => {
    registerBackgroundSync().catch(e => {
      // Background fetch is not available in Expo Go, so we can silently ignore this error
      console.log('Background sync registration skipped in this environment.');
    });
  }, []);

  return (
    <AuthProvider>
      <SQLiteProvider databaseName="dayframe.db" onInit={initializeDatabase}>
        <AppNavigator />
      </SQLiteProvider>
    </AuthProvider>
  );
}

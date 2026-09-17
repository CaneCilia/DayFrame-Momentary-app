import React, { useEffect } from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/db';
import { AuthProvider } from './src/contexts/AuthContext';
import { registerBackgroundSync } from './src/services/syncWorker';

export default function App() {
  useEffect(() => {
    registerBackgroundSync().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <SQLiteProvider databaseName="dayframe.db" onInit={initializeDatabase}>
        <AppNavigator />
      </SQLiteProvider>
    </AuthProvider>
  );
}

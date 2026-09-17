import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/db';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <SQLiteProvider databaseName="dayframe.db" onInit={initializeDatabase}>
        <AppNavigator />
      </SQLiteProvider>
    </AuthProvider>
  );
}

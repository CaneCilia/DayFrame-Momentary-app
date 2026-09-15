import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/database/db';

export default function App() {
  return (
    <SQLiteProvider databaseName="dayframe.db" onInit={initializeDatabase}>
      <AppNavigator />
    </SQLiteProvider>
  );
}

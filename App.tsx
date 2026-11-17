import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navegacao } from './src/navigation/Navegacao';
import { AppProvider } from './src/state/AppContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Navegacao />
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}

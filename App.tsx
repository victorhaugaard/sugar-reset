/**
 * SugarReset - Quit sugar. Built on habit science.
 * 
 * A modern, minimal, science-driven habit app for quitting sugar.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background.primary}
        />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

// Split out so it can call useTheme() — that hook only works inside
// ThemeProvider, which wraps this component, not App() itself.
function AppContent() {
  const { COLORS, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: COLORS.primary,
          background: COLORS.bg,
          card: COLORS.bgCard,
          text: COLORS.textPrimary,
          border: COLORS.bgCardBorder,
          notification: COLORS.primary,
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

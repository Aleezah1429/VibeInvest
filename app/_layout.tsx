import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090F' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="loading" />
        <Stack.Screen name="handoff" />
        <Stack.Screen name="report" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

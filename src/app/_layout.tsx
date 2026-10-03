import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth';
import { PreferencesProvider } from '@/preferences';

export default function RootLayout() {
  return <SafeAreaProvider><PreferencesProvider><AuthProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }} /></AuthProvider></PreferencesProvider></SafeAreaProvider>;
}

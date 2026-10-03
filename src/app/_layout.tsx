import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth';
import { PreferencesProvider } from '@/preferences';
import { colors } from '@/theme';

export default function RootLayout() {
  return <SafeAreaProvider><PreferencesProvider><AuthProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }} />
  </AuthProvider></PreferencesProvider></SafeAreaProvider>;
}

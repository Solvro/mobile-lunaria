import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/auth';
import { usePreferences } from '@/preferences';
import { colors } from '@/theme';

export default function Index() {
  const { ready, session, tracksCycle } = useAuth();
  const preferences = usePreferences();
  if (!ready || !preferences.ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}><ActivityIndicator color={colors.primary} /></View>;
  if (!session) return <Redirect href="/welcome" />;
  return <Redirect href={tracksCycle ? '/calendar' : '/partner'} />;
}

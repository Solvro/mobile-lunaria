import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/auth';
import { colors } from '@/theme';

export default function Index() {
  const { ready, session } = useAuth();
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.plum }}><ActivityIndicator color={colors.lavender} /></View>;
  return <Redirect href={session ? '/calendar' : '/welcome'} />;
}

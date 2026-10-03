import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/auth';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/i18n';
import { PartnerLinkProvider, usePartnerLink } from '@/partnerLink';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/welcome" />;
  return <PartnerLinkProvider><TabsNavigator /></PartnerLinkProvider>;
}

function TabsNavigator() {
  const { tracksCycle } = useAuth();
  const { partner, requests } = usePartnerLink();
  const { t } = useI18n();
  const incoming = requests.filter((request) => request.direction === 'incoming').length;
  // For someone who only follows, the partner tab is their whole app: name it after the person.
  const partnerTitle = !tracksCycle && partner ? partner.display_name : t('tabs.partner');

  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    sceneStyle: { backgroundColor: colors.background },
  }}>
    <Tabs.Screen name="calendar" options={{ title: t('tabs.cycle'), href: tracksCycle ? undefined : null, tabBarIcon: ({ color }) => <Icon name="calendar" color={color} size={22} /> }} />
    <Tabs.Screen name="partner" options={{ title: partnerTitle, tabBarBadge: incoming || undefined, tabBarBadgeStyle: { backgroundColor: colors.primary }, tabBarIcon: ({ color }) => <Icon name="partner" color={color} size={22} /> }} />
    <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={22} /> }} />
  </Tabs>;
}

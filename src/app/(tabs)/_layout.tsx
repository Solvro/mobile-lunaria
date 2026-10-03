import { Animated, Easing } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/auth';
import { Icon } from '@/components/Icon';
import { NavigationBar } from '@/components/NavigationBar';
import { useI18n } from '@/i18n';
import { PartnerLinkProvider, usePartnerLink } from '@/partnerLink';
import { colors, motion } from '@/theme';

export default function TabsLayout() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/welcome" />;
  return <PartnerLinkProvider><TabsNavigator /></PartnerLinkProvider>;
}

// Material 3 shared-axis transition: progress is -1 for tabs left of the active one and 1 for tabs
// to the right, so screens slide in from the side you're moving towards.
function sharedAxisX({ current }: { current: { progress: Animated.Value } }) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, -0.4, 0, 0.4, 1], outputRange: [0, 0, 1, 0, 0] }),
      transform: [{ translateX: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [-80, 0, 80] }) }],
    },
  };
}

function TabsNavigator() {
  const { tracksCycle } = useAuth();
  const { partner, requests } = usePartnerLink();
  const { t } = useI18n();
  const incoming = requests.filter((request) => request.direction === 'incoming').length;
  // For someone who only follows, the partner tab is their whole app: name it after the person.
  const partnerTitle = !tracksCycle && partner ? partner.display_name : t('tabs.partner');

  return <Tabs
    tabBar={(props) => <NavigationBar {...props} />}
    screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      sceneStyleInterpolator: sharedAxisX,
      transitionSpec: { animation: 'timing', config: { duration: motion.duration, easing: Easing.bezier(...motion.easing) } },
    }}
  >
    <Tabs.Screen name="calendar" options={{ title: t('tabs.cycle'), href: tracksCycle ? undefined : null, tabBarIcon: ({ color }) => <Icon name="calendar" color={color} size={24} /> }} />
    <Tabs.Screen name="partner" options={{ title: partnerTitle, tabBarBadge: incoming || undefined, tabBarIcon: ({ color }) => <Icon name="partner" color={color} size={24} /> }} />
    <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={24} /> }} />
  </Tabs>;
}

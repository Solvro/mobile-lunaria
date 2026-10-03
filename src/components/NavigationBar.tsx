import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tabs } from 'expo-router';
import { colors, motion, radius } from '@/theme';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

// Material 3 navigation bar: a pill-shaped indicator grows behind the active icon.
export function NavigationBar({ state, descriptors, navigation, insets }: TabBarProps) {
  const routes = state.routes.filter((route) => StyleSheet.flatten(descriptors[route.key].options.tabBarItemStyle)?.display !== 'none');
  const keyboardOpen = useKeyboardOpen();
  if (keyboardOpen) return null;

  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
    {routes.map((route) => {
      const { options } = descriptors[route.key];
      const focused = state.routes[state.index].key === route.key;
      const label = typeof options.title === 'string' ? options.title : route.name;
      const color = focused ? colors.primary : colors.muted;
      const onPress = () => {
        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
      };
      return <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}>
        <Indicator focused={focused}>
          {options.tabBarIcon?.({ focused, color, size: 24 })}
          {options.tabBarBadge !== undefined && <View style={styles.badge}><Text style={styles.badgeText}>{options.tabBarBadge}</Text></View>}
        </Indicator>
        <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>{label}</Text>
      </Pressable>;
    })}
  </View>;
}

// Android resizes the window for the keyboard, which would push the bar above it.
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return open;
}

function Indicator({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: focused ? 1 : 0, duration: motion.duration, easing: Easing.bezier(...motion.easing), useNativeDriver: true }).start();
  }, [focused]);

  return <View style={styles.indicatorSlot}>
    <Animated.View style={[styles.indicator, { opacity: progress, transform: [{ scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]} />
    {children}
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  indicatorSlot: { width: 64, height: 32, alignItems: 'center', justifyContent: 'center' },
  indicator: { ...StyleSheet.absoluteFill, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  label: { color: colors.muted, fontSize: 12, fontWeight: '500', letterSpacing: 0.4 },
  labelActive: { color: colors.text, fontWeight: '700' },
  badge: { position: 'absolute', top: 0, right: 14, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.onPrimary, fontSize: 11, fontWeight: '700' },
});

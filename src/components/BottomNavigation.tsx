import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/theme';

type Destination = 'calendar' | 'sharing' | 'settings';

const destinations: { key: Destination; label: string }[] = [
  { key: 'calendar', label: 'Calendar' },
  { key: 'sharing', label: 'Sharing' },
  { key: 'settings', label: 'Settings' },
];

export function BottomNavigation({ active }: { active: Destination }) {
  return <View style={styles.bar}>{destinations.map((destination) => <Pressable key={destination.key} accessibilityRole="tab" accessibilityState={{ selected: active === destination.key }} onPress={() => active !== destination.key && router.replace(`/${destination.key}`)} style={[styles.item, active === destination.key && styles.active]}><Text style={[styles.label, active === destination.key && styles.activeLabel]}>{destination.label}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.creamMuted, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  item: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  active: { backgroundColor: colors.lavender },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  activeLabel: { color: colors.plum },
});

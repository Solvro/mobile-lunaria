import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function PodMark({ size = 36 }: { size?: number }) {
  return <View style={[styles.pod, { width: size * 0.58, height: size }]}><View style={styles.vein} /></View>;
}

const styles = StyleSheet.create({
  pod: { borderWidth: 1.5, borderColor: colors.lavender, borderRadius: 999, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '28deg' }] },
  vein: { height: '72%', width: 1, backgroundColor: colors.lavender, opacity: 0.8 },
});

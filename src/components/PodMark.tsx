import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function PodMark({ size = 36, color = colors.primary }: { size?: number; color?: string }) {
  return <View style={[styles.pod, { width: size * 0.58, height: size, borderColor: color }]}><View style={[styles.vein, { backgroundColor: color }]} /></View>;
}

const styles = StyleSheet.create({
  pod: { borderWidth: 2, borderRadius: 999, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '28deg' }] },
  vein: { height: '72%', width: 1.5, opacity: 0.8 },
});

import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function PodMark({ size = 36, color = colors.primary }: { size?: number; color?: string }) {
  return <View style={[styles.moon, { width: size, height: size, backgroundColor: color }]}>
    <View style={[styles.moonCutout, { width: size * 0.97, height: size * 0.97, left: size * 0.31, top: -size * 0.21 }]} />
  </View>;
}

const styles = StyleSheet.create({
  moon: { borderRadius: 999, overflow: 'hidden' },
  moonCutout: { position: 'absolute', borderRadius: 999, backgroundColor: colors.surface },
});

import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function PodMark({ size = 36, color = colors.primary }: { size?: number; color?: string }) {
  return <View style={{ width: size, height: size }}>
    <View style={[styles.moon, { width: size * 0.72, height: size * 0.72, borderColor: color }]} />
    <View style={[styles.moonCutout, { width: size * 0.61, height: size * 0.61 }]} />
    <View style={[styles.crossVertical, { height: size * 0.28, backgroundColor: color }]} />
    <View style={[styles.crossHorizontal, { width: size * 0.28, backgroundColor: color }]} />
  </View>;
}

const styles = StyleSheet.create({
  moon: { position: 'absolute', left: 0, bottom: 0, borderWidth: 2.5, borderRadius: 999 },
  moonCutout: { position: 'absolute', right: 0, bottom: 0, borderRadius: 999, backgroundColor: colors.surface },
  crossVertical: { position: 'absolute', right: '7%', top: '5%', width: 2.5, borderRadius: 2 },
  crossHorizontal: { position: 'absolute', right: 0, top: '17%', height: 2.5, borderRadius: 2 },
});

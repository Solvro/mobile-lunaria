import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shape, elevation, space } from '@/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: shape.xl, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.lg, gap: space.md, ...elevation.level1 },
});

import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dim]}><Text style={styles.label}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 52, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.plum },
  label: { color: colors.cream, fontSize: 16, fontWeight: '700' },
  dim: { opacity: 0.7 },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { colors, radius } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({ label, onPress, disabled = false, loading = false, variant = 'primary', icon }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: Variant; icon?: IconName }) {
  const foreground = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled]}
  >
    {loading ? <ActivityIndicator color={foreground} /> : <View style={styles.row}>
      {icon && <Icon name={icon} size={18} color={foreground} />}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>}
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  ghost: { backgroundColor: 'transparent', minHeight: 44 },
  danger: { backgroundColor: colors.dangerSoft },
  label: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { colors, fonts, shape } from '@/theme';

// M3 buttons: primary = filled, secondary = tonal, outline = outlined, ghost = text, danger = tonal error.
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export function Button({ label, onPress, disabled = false, loading = false, variant = 'primary', icon }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: Variant; icon?: IconName }) {
  const foreground = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.error : colors.primary;
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
  base: { minHeight: 52, paddingHorizontal: 20, borderRadius: shape.full, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryContainer },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outline },
  ghost: { backgroundColor: 'transparent', minHeight: 44 },
  danger: { backgroundColor: colors.errorContainer },
  label: { fontFamily: fonts.body, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});

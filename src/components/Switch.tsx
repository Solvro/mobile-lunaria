import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme';

// Material 3 switch: a full-height track with a thumb that grows and shows a check when on.
export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }: { value: boolean; onValueChange: (value: boolean) => void; disabled?: boolean; accessibilityLabel?: string }) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: value ? 1 : 0, duration: 220, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: false }).start();
  }, [value]);

  const thumbSize = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 24] });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [6, 22] });
  const trackColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceMuted, colors.primary] });
  const borderColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.outline, colors.primary] });
  const thumbColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.outline, colors.onPrimary] });

  return <Pressable
    onPress={() => onValueChange(!value)}
    disabled={disabled}
    accessibilityRole="switch"
    accessibilityState={{ checked: value, disabled }}
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
    style={disabled && styles.disabled}
  >
    <Animated.View style={[styles.track, { backgroundColor: trackColor, borderColor }]}>
      <Animated.View style={[styles.thumb, { width: thumbSize, height: thumbSize, backgroundColor: thumbColor, transform: [{ translateX }] }]}>
        {value && <Icon name="check" size={14} color={colors.primary} />}
      </Animated.View>
    </Animated.View>
  </Pressable>;
}

const styles = StyleSheet.create({
  track: { width: 52, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: 'center' },
  thumb: { borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.38 },
});

import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import { colors } from '@/theme';

const icons = {
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  partner: { ios: 'person.2.fill', android: 'group', web: 'group' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  drop: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  forward: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  share: { ios: 'square.and.arrow.up', android: 'share', web: 'share' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  lock: { ios: 'lock.fill', android: 'lock', web: 'lock' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  eye: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, color = colors.text }: { name: IconName; size?: number; color?: ColorValue }) {
  return <SymbolView name={icons[name]} size={size} tintColor={color} style={{ width: size, height: size }} />;
}

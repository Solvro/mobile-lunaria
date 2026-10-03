import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DailyRecord } from '@/api/types';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { parseDate } from '@/cycle';
import { useI18n } from '@/i18n';
import { colors, radius, typography } from '@/theme';

export type Draft = Pick<DailyRecord, 'date' | 'is_period' | 'flow' | 'intimacy' | 'note'>;
export const flowLevels: NonNullable<DailyRecord['flow']>[] = ['spotting', 'light', 'medium', 'heavy'];

export function DaySheet({ draft, onChange, onClose, onSave, onClear, saving, canClear }: {
  draft: Draft | null;
  onChange: (draft: Draft) => void;
  onClose: () => void;
  onSave: () => void;
  onClear: () => void;
  saving: boolean;
  canClear: boolean;
}) {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  if (!draft) return null;
  const title = parseDate(draft.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });

  return <Modal transparent visible animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.cancel')} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.anchor}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={[typography.heading, styles.title]}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel={t('common.cancel')} hitSlop={8}><Icon name="close" size={16} color={colors.muted} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <ToggleCard
            icon="drop"
            label={t('sheet.period')}
            hint={t('sheet.periodHint')}
            active={draft.is_period}
            activeColor={colors.period}
            onPress={() => onChange({ ...draft, is_period: !draft.is_period, flow: draft.is_period ? null : draft.flow ?? 'medium' })}
          />
          {draft.is_period && <View style={styles.flowBlock}>
            <Text style={typography.label}>{t('sheet.flow')}</Text>
            <View style={styles.flows}>{flowLevels.map((flow, index) => {
              const active = draft.flow === flow;
              return <Pressable key={flow} onPress={() => onChange({ ...draft, flow })} style={[styles.flow, active && styles.flowActive]} accessibilityRole="radio" accessibilityState={{ selected: active }}>
                <View style={styles.drops}>{Array.from({ length: Math.max(1, index) }, (_, drop) => <Icon key={drop} name="drop" size={index === 0 ? 9 : 12} color={active ? colors.onPrimary : colors.period} />)}</View>
                <Text style={[styles.flowText, active && styles.flowTextActive]}>{t(`flow.${flow}`)}</Text>
              </Pressable>;
            })}</View>
          </View>}
          <ToggleCard
            icon="heart"
            label={t('sheet.intimacy')}
            hint={t('sheet.intimacyHint')}
            active={draft.intimacy}
            activeColor={colors.intimacy}
            onPress={() => onChange({ ...draft, intimacy: !draft.intimacy })}
          />
          <View style={styles.noteBox}>
            <Icon name="lock" size={14} color={colors.muted} />
            <TextInput
              value={draft.note ?? ''}
              onChangeText={(note) => onChange({ ...draft, note: note || null })}
              multiline
              placeholder={t('sheet.notePlaceholder')}
              placeholderTextColor={colors.muted}
              style={styles.note}
              accessibilityLabel={t('day.note')}
            />
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <Button label={t('sheet.save')} onPress={onSave} loading={saving} />
          {canClear && <Button label={t('sheet.clear')} onPress={onClear} variant="ghost" disabled={saving} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

function ToggleCard({ icon, label, hint, active, activeColor, onPress }: { icon: IconName; label: string; hint: string; active: boolean; activeColor: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.toggle, active && { borderColor: activeColor, backgroundColor: colors.surface }]} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityHint={hint}>
    <View style={[styles.toggleIcon, { backgroundColor: active ? activeColor : colors.surfaceMuted }]}><Icon name={icon} size={18} color={active ? colors.onPrimary : activeColor} /></View>
    <View style={styles.toggleText}>
      <Text style={typography.bodyStrong}>{label}</Text>
      <Text style={typography.caption}>{hint}</Text>
    </View>
    <View style={[styles.check, active && { backgroundColor: activeColor, borderColor: activeColor }]}>{active && <Icon name="check" size={13} color={colors.onPrimary} />}</View>
  </Pressable>;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.backdrop },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, maxHeight: '90%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { flex: 1 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  body: { gap: 12, paddingBottom: 12 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  toggleIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  toggleText: { flex: 1, gap: 1 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  flowBlock: { gap: 8, paddingHorizontal: 4 },
  flows: { flexDirection: 'row', gap: 8 },
  flow: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  flowActive: { backgroundColor: colors.period, borderColor: colors.period },
  drops: { flexDirection: 'row', height: 14, alignItems: 'center' },
  flowText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  flowTextActive: { color: colors.onPrimary },
  noteBox: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  note: { flex: 1, minHeight: 60, color: colors.text, fontSize: 15, textAlignVertical: 'top', padding: 0 },
  actions: { gap: 4, paddingTop: 4 },
});

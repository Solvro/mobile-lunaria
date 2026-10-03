import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useI18n } from '@/i18n';
import { colors, fonts, shape, typeScale } from '@/theme';

export function ConfirmationSheet({ visible, title, message, confirmation, confirmLabel, working, onCancel, onConfirm }: { visible: boolean; title: string; message: string; confirmation: string; confirmLabel: string; working: boolean; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const confirmed = value.trim().toLocaleLowerCase(locale) === confirmation.toLocaleLowerCase(locale);

  async function confirm() {
    await onConfirm();
    setValue('');
  }

  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
    <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel={t('common.cancel')} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.anchor}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <Text style={typeScale.titleLarge}>{title}</Text>
        <Text style={typeScale.bodyMedium}>{message}</Text>
        <Text style={typeScale.titleMedium}>{t('confirm.type', { word: confirmation })}</Text>
        <TextInput value={value} onChangeText={setValue} autoCapitalize="characters" autoCorrect={false} placeholder={confirmation} placeholderTextColor={colors.onSurfaceVariant} style={styles.input} accessibilityLabel={t('confirm.type', { word: confirmation })} />
        <Button label={confirmLabel} variant="danger" onPress={confirm} disabled={!confirmed} loading={working} />
        <Button label={t('common.cancel')} variant="ghost" onPress={onCancel} disabled={working} />
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, gap: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 6 },
  input: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: shape.md, minHeight: 52, paddingHorizontal: 14, color: colors.onSurface, fontFamily: fonts.body, fontSize: 16 },
});

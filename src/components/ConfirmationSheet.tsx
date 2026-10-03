import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/theme';

export function ConfirmationSheet({ visible, title, message, confirmation, confirmLabel, working, onCancel, onConfirm }: { visible: boolean; title: string; message: string; confirmation: string; confirmLabel: string; working: boolean; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [value, setValue] = useState('');
  const confirmed = value.trim().toLowerCase() === confirmation.toLowerCase();

  async function confirm() {
    await onConfirm();
    setValue('');
  }

  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}><Pressable style={styles.backdrop} onPress={onCancel} /><View style={styles.sheet}><View style={styles.handle} /><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text><Text style={styles.instruction}>Type {confirmation} to continue.</Text><TextInput value={value} onChangeText={setValue} autoCapitalize="none" autoCorrect={false} placeholder={confirmation} placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel={`Type ${confirmation} to confirm`} /><PrimaryButton label={working ? 'Working...' : confirmLabel} onPress={confirm} disabled={!confirmed || working} /><Pressable onPress={onCancel} disabled={working}><Text style={styles.cancel}>Cancel</Text></Pressable></View></Modal>;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#29152F88' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, gap: 14 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center' },
  title: { color: colors.plum, fontSize: 22, fontWeight: '700' }, message: { color: colors.muted, fontSize: 14, lineHeight: 21 }, instruction: { color: colors.text, fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, color: colors.text, fontSize: 16 }, cancel: { color: colors.muted, textAlign: 'center', fontWeight: '600', padding: 5 },
});

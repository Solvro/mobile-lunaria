import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/api/client';
import { useAuth } from '@/auth';
import { ConfirmationSheet } from '@/components/ConfirmationSheet';
import type { Language, WeekStart } from '@/preferences';
import { usePreferences } from '@/preferences';
import { colors, shadow } from '@/theme';
import { translate } from '@/i18n';

type DestructiveAction = 'cycle-data' | 'account' | null;

export default function Settings() {
  const { session, signOut } = useAuth();
  const { language, weekStart, setLanguage, setWeekStart } = usePreferences();
  const [destructiveAction, setDestructiveAction] = useState<DestructiveAction>(null);
  const [working, setWorking] = useState(false);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  async function changeLanguage(value: Language) {
    try { await setLanguage(value); }
    catch { Alert.alert('Could not save language', 'Try again shortly.'); }
  }

  async function changeWeekStart(value: WeekStart) {
    try { await setWeekStart(value); }
    catch { Alert.alert('Could not save calendar preference', 'Try again shortly.'); }
  }

  async function confirmDestructiveAction() {
    if (!session || !destructiveAction) return;
    setWorking(true);
    try {
      if (destructiveAction === 'cycle-data') {
        await api.deleteCycleData(session.token);
        Alert.alert('Cycle data deleted', 'Your logged cycle data has been permanently removed.');
      } else {
        await api.deleteAccount(session.token);
        await signOut();
        router.replace('/welcome');
      }
      setDestructiveAction(null);
    } catch (error) {
      Alert.alert('Could not complete request', error instanceof Error ? error.message : 'Try again shortly.');
    } finally { setWorking(false); }
  }

  async function leave() {
    await signOut();
    router.replace('/welcome');
  }

  const isAccount = destructiveAction === 'account';
  return <SafeAreaView style={styles.page} edges={['top']}><ScrollView contentContainerStyle={styles.content}><View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable></View><Text style={styles.eyebrow}>{t('settings').toUpperCase()}</Text><Text style={styles.title}>{t('yourSettings')}</Text>
    <Section title={t('language')}><ChoiceRow label={t('english')} selected={language === 'en'} onPress={() => changeLanguage('en')} /><ChoiceRow label={t('polish')} selected={language === 'pl'} onPress={() => changeLanguage('pl')} /></Section>
    <Section title={t('calendarSettings')}><Text style={styles.description}>{t('weekStartDescription')}</Text><ChoiceRow label={t('monday')} selected={weekStart === 'monday'} onPress={() => changeWeekStart('monday')} /><ChoiceRow label={t('sunday')} selected={weekStart === 'sunday'} onPress={() => changeWeekStart('sunday')} /></Section>
    <Section title={t('account')}><Pressable style={styles.row} onPress={leave}><Text style={styles.rowLabel}>{t('signOut')}</Text><Text style={styles.chevron}>›</Text></Pressable></Section>
    <View style={styles.danger}><Text style={styles.dangerTitle}>{t('deleteData')}</Text><Text style={styles.description}>{t('deleteDataDescription')}</Text><Pressable onPress={() => setDestructiveAction('cycle-data')}><Text style={styles.dangerAction}>{t('deleteCycleData')}</Text></Pressable><Pressable onPress={() => setDestructiveAction('account')}><Text style={styles.dangerAction}>{t('deleteAccount')}</Text></Pressable></View>
  </ScrollView><ConfirmationSheet visible={destructiveAction !== null} title={isAccount ? 'Delete account?' : 'Delete cycle data?'} message={isAccount ? 'This permanently deletes your account, linked sharing, and all cycle data. You will be signed out.' : 'This permanently deletes all logged cycle data. Your account will remain available.'} confirmation={isAccount ? 'DELETE' : 'CLEAR'} confirmLabel={isAccount ? 'Delete account' : 'Delete cycle data'} working={working} onCancel={() => !working && setDestructiveAction(null)} onConfirm={confirmDestructiveAction} /></SafeAreaView>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={[styles.section, shadow]}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function ChoiceRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable style={styles.row} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}><Text style={styles.rowLabel}>{label}</Text><View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View></Pressable>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, paddingBottom: 42, gap: 18 }, top: { height: 34 }, back: { color: colors.plum, fontSize: 34, lineHeight: 34 }, eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 6 }, title: { color: colors.plum, fontSize: 29, fontWeight: '700', letterSpacing: -0.5, marginTop: -10 },
  section: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 4 }, sectionTitle: { color: colors.plum, fontSize: 17, fontWeight: '700', marginBottom: 6 }, description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 5 }, row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.creamMuted }, rowLabel: { color: colors.text, fontSize: 15, fontWeight: '600' }, chevron: { color: colors.muted, fontSize: 25 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, radioSelected: { borderColor: colors.plum }, radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.plum },
   danger: { borderWidth: 1, borderColor: '#F59E0B66', borderRadius: 24, padding: 20, gap: 12 }, dangerTitle: { color: colors.rose, fontSize: 17, fontWeight: '700' }, dangerAction: { color: colors.rose, fontSize: 15, fontWeight: '700', paddingVertical: 5 },
});

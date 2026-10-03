import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { api } from '@/api/client';
import { useAuth } from '@/auth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmationSheet } from '@/components/ConfirmationSheet';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Switch } from '@/components/Switch';
import { useI18n } from '@/i18n';
import { usePreferences, type Language, type WeekStart } from '@/preferences';
import { colors, radius, space, typography } from '@/theme';

type DestructiveAction = 'cycle-data' | 'account' | null;

export default function Settings() {
  const { session, tracksCycle, setTracksCycle, signOut } = useAuth();
  const { language, weekStart, setLanguage, setWeekStart } = usePreferences();
  const { t } = useI18n();
  const [destructiveAction, setDestructiveAction] = useState<DestructiveAction>(null);
  const [working, setWorking] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function save(action: () => Promise<void>) {
    try { await action(); }
    catch { Alert.alert(t('settings.saveFailed'), t('common.tryAgain')); }
  }

  function changeTracksCycle(value: boolean) {
    if (value) return save(() => setTracksCycle(true));
    Alert.alert(t('settings.trackOffTitle'), t('settings.trackOffBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.turnOff'), onPress: () => save(() => setTracksCycle(false)) },
    ]);
  }

  async function confirmDestructiveAction() {
    if (!session || !destructiveAction) return;
    setWorking(true);
    try {
      if (destructiveAction === 'cycle-data') {
        await api.deleteCycleData(session.token);
        Alert.alert(t('settings.deleted'), t('settings.deletedBody'));
      } else {
        await api.deleteAccount(session.token);
        await signOut();
        router.replace('/welcome');
      }
      setDestructiveAction(null);
    } catch (error) {
      Alert.alert(t('settings.failed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally { setWorking(false); }
  }

  async function exportData() {
    if (!session) return;
    setExporting(true);
    try {
      const file = new File(Paths.cache, `lunaria-data-${new Date().toISOString().slice(0, 10)}.json`);
      file.write(JSON.stringify(await api.exportData(session.token), null, 2));
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: t('settings.export') });
    } catch (error) {
      Alert.alert(t('settings.exportFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally { setExporting(false); }
  }

  async function leave() {
    await signOut();
    router.replace('/welcome');
  }

  const isAccount = destructiveAction === 'account';
  return <>
    <Screen title={t('settings.title')}>
      <Card>
        <Text style={typography.heading}>{t('settings.mode')}</Text>
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Text style={typography.bodyStrong}>{t('settings.trackOwn')}</Text>
            <Text style={typography.caption}>{tracksCycle ? t('settings.trackOwnOn') : t('settings.trackOwnOff')}</Text>
          </View>
          <Switch value={tracksCycle} onValueChange={changeTracksCycle} accessibilityLabel={t('settings.trackOwn')} />
        </View>
      </Card>

      <Card>
        <Text style={typography.heading}>{t('settings.language')}</Text>
        <Segmented<Language> value={language} options={[{ value: 'pl', label: 'Polski' }, { value: 'en', label: 'English' }]} onChange={(value) => save(() => setLanguage(value))} />
        <Text style={[typography.heading, styles.spaced]}>{t('settings.weekStart')}</Text>
        <Segmented<WeekStart> value={weekStart} options={[{ value: 'monday', label: t('settings.monday') }, { value: 'sunday', label: t('settings.sunday') }]} onChange={(value) => save(() => setWeekStart(value))} />
      </Card>

      <Card>
        <Text style={typography.heading}>{t('settings.account')}</Text>
        <View style={styles.accountRow}>
          <View style={styles.avatar}><Icon name="person" size={20} color={colors.primary} /></View>
          <View style={styles.flex}>
            <Text style={typography.bodyStrong}>{session?.account.display_name}</Text>
            <Text style={typography.caption}>{session?.account.email}</Text>
          </View>
        </View>
        <Button label={t('settings.export')} icon="share" variant="secondary" onPress={exportData} loading={exporting} />
        <Button label={t('settings.signOut')} variant="secondary" onPress={leave} />
      </Card>

      <View style={styles.danger}>
        <Text style={[typography.heading, styles.dangerTitle]}>{t('settings.dangerZone')}</Text>
        <Text style={typography.caption}>{t('settings.dangerBody')}</Text>
        {tracksCycle && <Button label={t('settings.deleteCycle')} variant="danger" onPress={() => setDestructiveAction('cycle-data')} />}
        <Button label={t('settings.deleteAccount')} variant="danger" onPress={() => setDestructiveAction('account')} />
      </View>
      <Text style={styles.disclaimer}>{t('cycle.disclaimer')}</Text>
    </Screen>
    <ConfirmationSheet
      visible={destructiveAction !== null}
      title={isAccount ? t('settings.deleteAccountTitle') : t('settings.deleteCycleTitle')}
      message={isAccount ? t('settings.deleteAccountBody') : t('settings.deleteCycleBody')}
      confirmation={isAccount ? t('confirm.wordAccount') : t('confirm.wordCycle')}
      confirmLabel={isAccount ? t('settings.deleteAccount') : t('settings.deleteCycle')}
      working={working}
      onCancel={() => !working && setDestructiveAction(null)}
      onConfirm={confirmDestructiveAction}
    />
  </>;
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  return <View style={styles.segmented} accessibilityRole="radiogroup">
    {options.map((option, index) => {
      const active = option.value === value;
      return <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, index > 0 && styles.segmentDivider, active && styles.segmentActive]} accessibilityRole="radio" accessibilityState={{ selected: active }}>
        {active && <Icon name="check" size={16} color={colors.text} />}
        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  spaced: { marginTop: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Material 3 segmented buttons: outlined pill, selected segment tinted with a check.
  segmented: { flexDirection: 'row', borderWidth: 1, borderColor: colors.outline, borderRadius: radius.pill, overflow: 'hidden' },
  segment: { flex: 1, minHeight: 48, flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'center' },
  segmentDivider: { borderLeftWidth: 1, borderLeftColor: colors.outline },
  segmentActive: { backgroundColor: colors.primarySoft },
  segmentText: { color: colors.text, fontWeight: '500', fontSize: 15 },
  segmentTextActive: { fontWeight: '700' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  danger: { borderWidth: 1, borderColor: colors.dangerSoft, borderRadius: radius.lg, padding: space.lg, gap: space.md },
  disclaimer: { ...typography.caption, fontSize: 13, textAlign: 'center', paddingHorizontal: space.md },
  dangerTitle: { color: colors.danger },
});

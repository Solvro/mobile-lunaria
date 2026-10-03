import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '@/api/client';
import type { DailyRecord, Prediction } from '@/api/types';
import { useAuth } from '@/auth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CycleHero } from '@/components/CycleHero';
import { DaySheet, type Draft } from '@/components/DaySheet';
import { DayDetails } from '@/components/DayDetails';
import { MonthCalendar } from '@/components/MonthCalendar';
import { Screen } from '@/components/Screen';
import { addDays, currentPeriod, dayClassifier, daysBetween, isoDate, parseDate, recentRange, startOfMonth, todayIso } from '@/cycle';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/preferences';
import { colors, typography } from '@/theme';

function toDraft(record: DailyRecord | undefined, date: string, startPeriod = false): Draft {
  if (record) return { date, is_period: record.is_period, flow: record.flow, intimacy: record.intimacy, note: record.note };
  return { date, is_period: startPeriod, flow: startPeriod ? 'medium' : null, intimacy: false, note: null };
}

export default function Calendar() {
  const { session } = useAuth();
  const { weekStart } = usePreferences();
  const { t } = useI18n();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(todayIso());
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  // Kept separately from the visible month so the hero always describes today.
  const [recent, setRecent] = useState<DailyRecord[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = session?.token;
  // Load a little past both month edges so ongoing periods are counted correctly.
  const rangeStart = isoDate(addDays(startOfMonth(month), -14));
  const rangeEnd = isoDate(addDays(new Date(month.getFullYear(), month.getMonth() + 1, 0), 7));

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { start, end } = recentRange();
      const [items, latest, estimate] = await Promise.all([api.records(token, rangeStart, rangeEnd), api.records(token, start, end), api.predictions(token)]);
      setRecords(items);
      setRecent(latest);
      setPrediction(estimate);
    } catch (error) {
      Alert.alert(t('cycle.loadFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setLoading(false);
    }
  }, [token, rangeStart, rangeEnd]);

  useEffect(() => { refresh(); }, [refresh]);

  const byDate = new Map(records.map((record) => [record.date, record]));
  const classify = dayClassifier(records, prediction);
  const today = todayIso();
  const todayRecord = recent.find((record) => record.date === today);
  const period = currentPeriod(recent, { usualLength: prediction?.average_period_duration });
  const hasPeriodData = !!prediction || recent.some((record) => record.is_period);
  const periodSoon = !prediction || daysBetween(today, prediction.next_period_start) <= 7;

  // Pre-tick "period" when logging a past day is most likely about a period:
  // nothing logged yet, or the day touches an already logged period day.
  function likelyPeriod(iso: string) {
    if (!hasPeriodData) return true;
    const neighbours = [addDays(parseDate(iso), -1), addDays(parseDate(iso), 1)].map(isoDate);
    return neighbours.some((day) => byDate.get(day)?.is_period);
  }

  // One tap while a period is ongoing: log today with yesterday's flow.
  async function continuePeriod() {
    if (!token) return;
    setSaving(true);
    try {
      const yesterdayIso = isoDate(addDays(new Date(), -1));
      const yesterday = recent.find((record) => record.date === yesterdayIso);
      await api.saveRecord(token, { date: today, is_period: true, flow: yesterday?.flow ?? 'medium', intimacy: false, note: null });
      await refresh();
    } catch (error) {
      Alert.alert(t('cycle.saveFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!draft || !token) return;
    setSaving(true);
    try {
      const existing = byDate.get(draft.date);
      // An entry with nothing in it is the same as no entry.
      if (!draft.is_period && !draft.intimacy && !draft.note) {
        if (existing) await api.deleteRecord(token, existing.id);
      } else {
        await api.saveRecord(token, draft);
      }
      setDraft(null);
      await refresh();
    } catch (error) {
      Alert.alert(t('cycle.saveFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    if (!draft || !token) return;
    const existing = byDate.get(draft.date);
    setSaving(true);
    try {
      if (existing) await api.deleteRecord(token, existing.id);
      setDraft(null);
      await refresh();
    } catch (error) {
      Alert.alert(t('cycle.saveFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setSaving(false);
    }
  }

  return <>
    <Screen title={t('cycle.greeting', { name: session?.account.display_name ?? '' })} refreshing={loading} onRefresh={refresh}>
      <CycleHero prediction={prediction} records={recent}>
        <View style={styles.heroAction}>
          {todayRecord?.is_period
            ? <Button label={t('cycle.editToday')} icon="edit" variant="secondary" onPress={() => setDraft(toDraft(todayRecord, today))} />
            : period.day > 0
              ? <Button label={t('cycle.continueToday')} icon="drop" loading={saving} onPress={continuePeriod} />
              : <Button label={t('cycle.logToday')} icon="drop" variant={periodSoon ? 'primary' : 'secondary'} onPress={() => setDraft(toDraft(todayRecord, today, true))} />}
          {!hasPeriodData && <Text style={styles.heroHint}>{t('cycle.startedEarlier')}</Text>}
        </View>
      </CycleHero>
      <Card>
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          weekStart={weekStart}
          classify={classify}
          selected={selected}
          onSelect={setSelected}
          legend={['period', 'predicted', 'fertile', 'ovulation', 'intimacy']}
        />
      </Card>
      <DayDetails
        iso={selected}
        info={classify(selected)}
        record={byDate.get(selected)}
        action={selected <= today
          ? <Button label={byDate.has(selected) ? t('day.edit') : t('day.add')} icon={byDate.has(selected) ? 'edit' : 'plus'} variant="secondary" onPress={() => setDraft(toDraft(byDate.get(selected), selected, likelyPeriod(selected)))} />
          : <Text style={typography.caption}>{t('day.future')}</Text>}
      />
      <Text style={styles.disclaimer}>{t('cycle.disclaimer')}</Text>
    </Screen>
    <DaySheet draft={draft} onChange={setDraft} onClose={() => !saving && setDraft(null)} onSave={save} onClear={clear} saving={saving} canClear={!!draft && byDate.has(draft.date)} />
  </>;
}

const styles = StyleSheet.create({
  heroAction: { marginTop: 8, gap: 8 },
  heroHint: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  disclaimer: { ...typography.caption, fontSize: 12, lineHeight: 17, textAlign: 'center', paddingHorizontal: 12 },
});

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '@/api/client';
import type { PartnerView } from '@/api/types';
import { useAuth } from '@/auth';
import { Card } from '@/components/Card';
import { CycleHero } from '@/components/CycleHero';
import { DayDetails } from '@/components/DayDetails';
import { Icon } from '@/components/Icon';
import { MonthCalendar, type LegendKey } from '@/components/MonthCalendar';
import { addDays, dayClassifier, isoDate, recentRange, startOfMonth, todayIso } from '@/cycle';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/preferences';
import { colors, radius } from '@/theme';

// Read-only view of the linked partner's calendar, limited to what they share.
export function SharedCalendar({ refreshKey = 0 }: { refreshKey?: number }) {
  const { session } = useAuth();
  const { weekStart } = usePreferences();
  const { t } = useI18n();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(todayIso());
  const [view, setView] = useState<PartnerView | null>(null);
  const [recent, setRecent] = useState<PartnerView['records']>([]);
  const [loading, setLoading] = useState(true);
  const token = session?.token;
  const rangeStart = isoDate(addDays(startOfMonth(month), -14));
  const rangeEnd = isoDate(addDays(new Date(month.getFullYear(), month.getMonth() + 1, 0), 7));

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { start, end } = recentRange();
      const [visible, latest] = await Promise.all([api.partnerView(token, rangeStart, rangeEnd), api.partnerView(token, start, end)]);
      setView(visible);
      setRecent(latest.records);
    }
    catch (error) { Alert.alert(t('partner.loadFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
    finally { setLoading(false); }
  }, [token, rangeStart, rangeEnd]);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (!view) return loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null;

  const name = view.partner.display_name;
  const classify = dayClassifier(view.records, view.prediction);
  const sharesPeriods = view.records.some((record) => record.is_period !== undefined);
  const sharesIntimacy = view.records.some((record) => record.intimacy !== undefined);
  const sharesAnything = sharesPeriods || sharesIntimacy || !!view.prediction;
  const legend: LegendKey[] = [
    ...(sharesPeriods ? ['period' as const] : []),
    ...(view.prediction ? ['predicted' as const, 'fertile' as const, 'ovulation' as const] : []),
    ...(sharesIntimacy ? ['intimacy' as const] : []),
  ];

  return <View style={styles.wrapper}>
    <CycleHero prediction={view.prediction} records={recent} partnerName={name} />
    <Card>
      <MonthCalendar month={month} onMonthChange={setMonth} weekStart={weekStart} classify={classify} selected={selected} onSelect={setSelected} legend={legend} />
    </Card>
    <DayDetails iso={selected} info={classify(selected)} />
    <View style={styles.notice}>
      <Icon name="eye" size={16} color={colors.muted} />
      <Text style={styles.noticeText}>{sharesAnything ? t('partner.readOnly', { name }) : t('partner.nothingShared', { name })}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: 16 },
  loading: { marginVertical: 32 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  noticeText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 20 },
});

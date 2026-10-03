import { StyleSheet, Text, View } from 'react-native';
import type { DailyRecord } from '@/api/types';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { parseDate, todayIso, type DayInfo } from '@/cycle';
import { useI18n } from '@/i18n';
import { colors, typography } from '@/theme';

// Plain-language summary of the day selected in the calendar.
export function DayDetails({ iso, info, record, action }: { iso: string; info: DayInfo; record?: Pick<DailyRecord, 'flow' | 'note'>; action?: React.ReactNode }) {
  const { t, locale } = useI18n();
  const label = parseDate(iso).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const rows: { icon: IconName; color: string; text: string }[] = [];
  if (info.kind === 'period') rows.push({ icon: 'drop', color: colors.period, text: record?.flow ? t('day.periodFlow', { flow: t(`flow.${record.flow}`).toLowerCase() }) : t('calendar.period') });
  if (info.kind === 'predicted') rows.push({ icon: 'drop', color: colors.periodText, text: t('calendar.predicted') });
  if (info.kind === 'fertile') rows.push({ icon: 'info', color: colors.fertile, text: t('calendar.fertile') });
  if (info.ovulation) rows.push({ icon: 'info', color: colors.fertile, text: t('calendar.ovulation') });
  if (info.intimacy) rows.push({ icon: 'heart', color: colors.intimacy, text: t('calendar.intimacy') });
  if (record?.note) rows.push({ icon: 'lock', color: colors.muted, text: record.note });

  return <Card style={styles.card}>
    <View style={styles.header}>
      <Text style={typography.heading}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
      {iso === todayIso() && <Text style={styles.today}>{t('common.today')}</Text>}
    </View>
    {rows.length === 0
      ? <Text style={typography.caption}>{t('day.nothing')}</Text>
      : rows.map((row, index) => <View key={index} style={styles.row}><Icon name={row.icon} size={16} color={row.color} /><Text style={[typography.body, styles.rowText]}>{row.text}</Text></View>)}
    {action}
  </Card>;
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  today: { color: colors.primary, fontWeight: '700', fontSize: 13, backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1 },
});

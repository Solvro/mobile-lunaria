import { StyleSheet, Text, View } from 'react-native';
import type { Prediction } from '@/api/types';
import { Icon } from '@/components/Icon';
import { addDays, currentPeriod, daysBetween, isoDate, parseDate, todayIso, type DayRecordLike } from '@/cycle';
import { useI18n } from '@/i18n';
import { colors, radius, shadow, typography } from '@/theme';

// The headline card: where you are in the cycle right now, in one glance.
export function CycleHero({ prediction, records, partnerName, children }: { prediction: Prediction | null; records: DayRecordLike[]; partnerName?: string; children?: React.ReactNode }) {
  const { t, locale, days } = useI18n();
  const today = todayIso();
  // A partner only sees days that were actually logged, never a guess.
  const period = currentPeriod(records, { usualLength: prediction?.average_period_duration, confirmedOnly: !!partnerName });
  const untilPeriod = prediction ? daysBetween(today, prediction.next_period_start) : null;
  const fertileToday = !!prediction && today >= prediction.fertile_window_start && today <= prediction.fertile_window_end;
  const ovulationToday = prediction?.ovulation_date === today;

  // Short eyebrow + a big headline that stays one line on small phones.
  let eyebrow: string | null = null;
  let headline: string;
  let big = true;
  let tone: 'period' | 'fertile' | 'neutral' = 'neutral';
  if (period.day > 0) {
    eyebrow = partnerName ? t('partner.hasPeriod', { name: partnerName }) : t('cycle.period');
    headline = t('cycle.dayN', { day: period.day });
    tone = 'period';
  } else if (untilPeriod !== null && untilPeriod > 0) {
    eyebrow = t('cycle.periodIn');
    headline = days(untilPeriod);
    if (fertileToday) tone = 'fertile';
  } else if (untilPeriod !== null) {
    // A late period is sensitive; a partner only sees that it may start soon.
    eyebrow = t('cycle.period');
    headline = untilPeriod === 0 ? t('cycle.mayStartToday') : partnerName ? t('partner.anyDay') : t('cycle.late', { days: days(-untilPeriod) });
    big = false;
    if (!partnerName) tone = 'period';
  } else {
    eyebrow = partnerName ? null : t('cycle.emptyTitle');
    headline = partnerName ? t('partner.noPrediction') : t('cycle.empty');
    big = false;
  }

  const background = tone === 'period' ? colors.periodSoft : tone === 'fertile' ? colors.fertileSoft : colors.surface;
  const expected = prediction && parseDate(prediction.next_period_start).toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const hideLate = !!partnerName && untilPeriod !== null && untilPeriod < 0;
  const details = [
    period.day > 0 && !period.confirmed && !partnerName && t('cycle.notLoggedToday'),
    period.day === 0 && !hideLate && expected && t('cycle.expected', { date: expected }),
    !hideLate && prediction?.current_cycle_day && t('cycle.cycleDay', { day: prediction.current_cycle_day }),
  ].filter(Boolean);

  return <View style={[styles.card, { backgroundColor: background }]}>
    {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
    <Text style={big ? styles.headline : styles.headlineText} accessibilityRole="header" numberOfLines={big ? 1 : undefined} adjustsFontSizeToFit={big}>{headline}</Text>
    {details.length > 0 && <Text style={typography.caption}>{details.join(' · ')}</Text>}
    {(fertileToday || ovulationToday) && <View style={styles.chips}>
      <View style={styles.chip}><View style={styles.chipDot} /><Text style={styles.chipText}>{ovulationToday ? t('cycle.ovulationToday') : t('cycle.fertileToday')}</Text></View>
    </View>}
    {prediction && !hideLate && <CycleBar prediction={prediction} />}
    {prediction && <View style={styles.confidence}><Icon name="info" size={13} color={colors.muted} /><Text style={styles.confidenceText}>{t(`cycle.confidence.${prediction.confidence}`)}</Text></View>}
    {children}
  </View>;
}

// A single bar for the current cycle: period, fertile window and a marker for today.
function CycleBar({ prediction }: { prediction: Prediction }) {
  const length = Math.max(prediction.average_cycle_length, 1);
  const cycleStart = isoDate(addDays(parseDate(prediction.next_period_start), -length));
  const today = todayIso();
  const position = (iso: string) => Math.min(Math.max(daysBetween(cycleStart, iso) / length, 0), 1);
  const fertileStart = position(prediction.fertile_window_start);
  const fertileEnd = position(isoDate(addDays(parseDate(prediction.fertile_window_end), 1)));
  const periodEnd = Math.min(prediction.average_period_duration / length, 1);
  const marker = position(today);

  return <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <View style={[styles.segment, { left: 0, width: `${periodEnd * 100}%`, backgroundColor: colors.period }]} />
    <View style={[styles.segment, { left: `${fertileStart * 100}%`, width: `${Math.max(fertileEnd - fertileStart, 0) * 100}%`, backgroundColor: colors.fertile }]} />
    <View style={[styles.marker, { left: `${marker * 100}%` }]} />
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 20, gap: 8, ...shadow },
  eyebrow: { color: colors.text, fontSize: 15, fontWeight: '600' },
  headline: { color: colors.text, fontSize: 40, lineHeight: 46, fontWeight: '800', letterSpacing: -1 },
  headlineText: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.surface },
  chipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.fertile },
  chipText: { color: colors.fertileText, fontSize: 13, fontWeight: '700' },
  bar: { height: 10, borderRadius: 5, backgroundColor: colors.surfaceMuted, marginTop: 10, marginBottom: 4 },
  segment: { position: 'absolute', top: 0, bottom: 0, borderRadius: 5 },
  marker: { position: 'absolute', top: -4, width: 4, height: 18, marginLeft: -2, borderRadius: 2, backgroundColor: colors.text, borderWidth: 1, borderColor: colors.surface },
  confidence: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confidenceText: { color: colors.muted, fontSize: 13 },
});

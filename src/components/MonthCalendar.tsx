import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { addDays, isoDate, startOfMonth, todayIso, type DayInfo, type DayKind } from '@/cycle';
import { useI18n } from '@/i18n';
import type { WeekStart } from '@/preferences';
import { colors, radius } from '@/theme';

export type LegendKey = 'period' | 'predicted' | 'fertile' | 'ovulation' | 'intimacy';

const fills: Record<NonNullable<DayKind>, { background: string; text: string }> = {
  period: { background: colors.period, text: colors.onPrimary },
  predicted: { background: colors.periodSoft, text: colors.periodText },
  fertile: { background: colors.fertileBand, text: colors.fertileText },
};

export function MonthCalendar({ month, onMonthChange, weekStart, classify, selected, onSelect, legend }: {
  month: Date;
  onMonthChange: (month: Date) => void;
  weekStart: WeekStart;
  classify: (iso: string) => DayInfo;
  selected: string;
  onSelect: (iso: string) => void;
  legend: LegendKey[];
}) {
  const { t, locale } = useI18n();
  const today = todayIso();
  const first = startOfMonth(month);
  const offset = weekStart === 'monday' ? (first.getDay() + 6) % 7 : first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const rows = Array.from({ length: weeks }, (_, week) => Array.from({ length: 7 }, (_, weekday) => addDays(first, week * 7 + weekday - offset)));
  const weekdays = Array.from({ length: 7 }, (_, index) => addDays(new Date(2023, 0, weekStart === 'monday' ? 2 : 1), index).toLocaleDateString(locale, { weekday: 'short' }).replace('.', ''));
  const title = first.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const isCurrentMonth = isoDate(first) === isoDate(startOfMonth(new Date()));
  const go = (delta: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return <View style={styles.wrapper}>
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
      <View style={styles.nav}>
        {!isCurrentMonth && <Pressable onPress={() => { onMonthChange(startOfMonth(new Date())); onSelect(today); }} style={styles.todayPill} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.todayPillText}>{t('calendar.backToToday')}</Text>
        </Pressable>}
        <Pressable onPress={() => go(-1)} style={styles.navButton} accessibilityRole="button" accessibilityLabel={t('calendar.prev')} hitSlop={6}><Icon name="back" size={18} /></Pressable>
        <Pressable onPress={() => go(1)} style={styles.navButton} accessibilityRole="button" accessibilityLabel={t('calendar.next')} hitSlop={6}><Icon name="forward" size={18} /></Pressable>
      </View>
    </View>
    <View style={styles.row}>{weekdays.map((day, index) => <Text key={index} style={styles.weekday}>{day}</Text>)}</View>
    {rows.map((days, rowIndex) => {
      const infos = days.map((day) => day.getMonth() === month.getMonth() ? classify(isoDate(day)) : null);
      return <View key={rowIndex} style={styles.row}>{days.map((day, index) => {
        const info = infos[index];
        if (!info) return <View key={index} style={styles.cell} />;
        const iso = isoDate(day);
        const kind = info.kind;
        const joinsLeft = !!kind && infos[index - 1]?.kind === kind;
        const joinsRight = !!kind && infos[index + 1]?.kind === kind;
        const fill = kind ? fills[kind] : null;
        const isSelected = iso === selected;
        const isToday = iso === today;
        const statuses = [kind && t(kind === 'period' ? 'calendar.period' : kind === 'predicted' ? 'calendar.predicted' : 'calendar.fertile'), info.ovulation && t('calendar.ovulation'), info.intimacy && t('calendar.intimacy'), isToday && t('common.today')].filter(Boolean);
        return <Pressable
          key={index}
          style={styles.cell}
          onPress={() => onSelect(iso)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={[day.toLocaleDateString(locale, { day: 'numeric', month: 'long' }), ...statuses].join(', ')}
        >
          {fill && <View style={[styles.band, { backgroundColor: fill.background }, joinsLeft ? styles.joinLeft : styles.capLeft, joinsRight ? styles.joinRight : styles.capRight, kind === 'predicted' && [styles.predictedOutline, !joinsLeft && styles.outlineLeft, !joinsRight && styles.outlineRight]]} />}
          <View style={[styles.number, isSelected && styles.selected, info.ovulation && styles.ovulation]}>
            <Text style={[styles.dayText, fill && { color: fill.text }, isToday && styles.todayText, isToday && !fill && styles.todayColor, isSelected && styles.selectedText]}>{day.getDate()}</Text>
          </View>
          {isToday && <View style={styles.todayMark} />}
          {info.intimacy && <View style={styles.heart}><Icon name="heart" size={9} color={colors.intimacy} /></View>}
        </Pressable>;
      })}</View>;
    })}
    {legend.length > 0 && <View style={styles.legend}>{legend.map((key) => <LegendItem key={key} kind={key} label={t(`calendar.${key}`)} />)}</View>}
  </View>;
}

function LegendItem({ kind, label }: { kind: LegendKey; label: string }) {
  const swatch = kind === 'ovulation' ? styles.swatchOvulation : kind === 'intimacy' ? null : [{ backgroundColor: fills[kind].background }, kind === 'predicted' && styles.swatchPredicted];
  return <View style={styles.legendItem}>
    {kind === 'intimacy' ? <Icon name="heart" size={12} color={colors.intimacy} /> : <View style={[styles.swatch, swatch]} />}
    <Text style={styles.legendText}>{label}</Text>
  </View>;
}

const CELL = 52;

const styles = StyleSheet.create({
  wrapper: { gap: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  todayPill: { paddingHorizontal: 12, height: 32, borderRadius: radius.pill, backgroundColor: colors.primarySoft, justifyContent: 'center' },
  todayPillText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '600', paddingBottom: 6, textTransform: 'capitalize' },
  cell: { flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center' },
  band: { position: 'absolute', top: 7, bottom: 7, left: 0, right: 0 },
  predictedOutline: { borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.period },
  outlineLeft: { borderLeftWidth: 1.5 },
  outlineRight: { borderRightWidth: 1.5 },
  capLeft: { left: 3, borderTopLeftRadius: radius.pill, borderBottomLeftRadius: radius.pill },
  capRight: { right: 3, borderTopRightRadius: radius.pill, borderBottomRightRadius: radius.pill },
  joinLeft: { left: 0 },
  joinRight: { right: 0 },
  number: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.text },
  ovulation: { borderWidth: 2, borderColor: colors.fertile },
  dayText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  todayText: { fontWeight: '800' },
  todayColor: { color: colors.primary },
  selectedText: { color: colors.surface },
  todayMark: { position: 'absolute', top: 1, width: 14, height: 2.5, borderRadius: 2, backgroundColor: colors.primary },
  heart: { position: 'absolute', bottom: 0, alignSelf: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  swatchPredicted: { borderWidth: 1.5, borderColor: colors.period },
  swatchOvulation: { borderWidth: 2, borderColor: colors.fertile, backgroundColor: colors.surface },
  legendText: { color: colors.muted, fontSize: 13 },
});

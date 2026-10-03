import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/Icon';
import { addDays, isoDate, startOfMonth, todayIso, type DayInfo, type DayKind } from '@/cycle';
import { useI18n } from '@/i18n';
import type { WeekStart } from '@/preferences';
import { colors, shape, space } from '@/theme';

export type LegendKey = 'period' | 'predicted' | 'fertile' | 'ovulation' | 'intimacy';

// Every day is a circle; its fill says what kind of day it is.
const fills: Record<NonNullable<DayKind>, { background: string; text: string; border?: string }> = {
  period: { background: colors.period, text: colors.onPrimary },
  predicted: { background: colors.periodContainer, text: colors.onPeriodContainer, border: colors.period },
  fertile: { background: colors.fertileContainer, text: colors.onFertileContainer },
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
  // Explicit pixel size with radius = size / 2: percentage sizes with an oversized radius can render square.
  const { width: windowWidth } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(windowWidth - 88);
  const size = Math.min(CIRCLE, Math.floor(gridWidth / 7) - 4);
  const circleSize = { width: size, height: size, borderRadius: size / 2 };
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

  return <View style={styles.wrapper} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
      {!isCurrentMonth && <Pressable onPress={() => { onMonthChange(startOfMonth(new Date())); onSelect(today); }} style={styles.navButton} accessibilityRole="button" accessibilityLabel={t('calendar.backToToday')} hitSlop={4}>
        <Icon name="calendar" size={20} color={colors.primary} />
      </Pressable>}
      <Pressable onPress={() => go(-1)} style={styles.navButton} accessibilityRole="button" accessibilityLabel={t('calendar.prev')} hitSlop={4}><Icon name="back" size={20} /></Pressable>
      <Pressable onPress={() => go(1)} style={styles.navButton} accessibilityRole="button" accessibilityLabel={t('calendar.next')} hitSlop={4}><Icon name="forward" size={20} /></Pressable>
    </View>
    <View style={styles.row}>{weekdays.map((day, index) => <Text key={index} style={styles.weekday}>{day}</Text>)}</View>
    {rows.map((days, rowIndex) => <View key={rowIndex} style={styles.row}>{days.map((day, index) => {
      if (day.getMonth() !== month.getMonth()) return <View key={index} style={styles.cell} />;
      const iso = isoDate(day);
      const info = classify(iso);
      const fill = info.kind ? fills[info.kind] : null;
      const isSelected = iso === selected;
      const isToday = iso === today;
      const statuses = [info.kind && t(info.kind === 'period' ? 'calendar.period' : info.kind === 'predicted' ? 'calendar.predicted' : 'calendar.fertile'), info.ovulation && t('calendar.ovulation'), info.intimacy && t('calendar.intimacy'), isToday && t('common.today')].filter(Boolean);
      return <Pressable
        key={index}
        style={styles.cell}
        onPress={() => onSelect(iso)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={[day.toLocaleDateString(locale, { day: 'numeric', month: 'long' }), ...statuses].join(', ')}
      >
        {/* Keyed by its look: Android (RN 0.86) drops the corner radius when the background changes on an existing view. */}
        <View key={`${info.kind}-${isSelected}-${isToday}-${info.ovulation}-${size}`} style={[
          styles.circle,
          fill && { backgroundColor: fill.background },
          fill?.border && { borderWidth: 1.5, borderColor: fill.border, borderStyle: 'dashed' },
          info.ovulation && styles.ovulation,
          isSelected && (fill ? styles.selectedOnFill : styles.selected),
          circleSize,
        ]}>
          <Text style={[styles.dayText, fill && { color: fill.text }, isToday && styles.todayText, isSelected && !fill && styles.selectedText]}>{day.getDate()}</Text>
          {isToday && <View style={[styles.todayDot, { backgroundColor: isSelected && !fill ? colors.surfaceContainerLowest : fill ? fill.text : colors.primary }]} />}
        </View>
        {info.intimacy && <View style={[styles.heart, { top: (CELL_HEIGHT + size) / 2 + space.xs }]}><Icon name="heart" size={10} color={colors.error} /></View>}
      </Pressable>;
    })}</View>)}
    {legend.length > 0 && <View style={styles.legend}>{legend.map((key) => <LegendItem key={key} kind={key} label={t(`calendar.${key}`)} />)}</View>}
  </View>;
}

function LegendItem({ kind, label }: { kind: LegendKey; label: string }) {
  const swatch = kind === 'ovulation' || kind === 'intimacy'
    ? styles.swatchOvulation
    : [{ backgroundColor: fills[kind].background }, kind === 'predicted' && styles.swatchPredicted];
  return <View style={styles.legendItem}>
    {kind === 'intimacy' ? <Icon name="heart" size={12} color={colors.intimacy} /> : <View style={[styles.swatch, swatch]} />}
    <Text style={styles.legendText}>{label}</Text>
  </View>;
}

const CIRCLE = 40;
const CELL_HEIGHT = CIRCLE + 18;

const styles = StyleSheet.create({
  wrapper: { gap: space.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  title: { flex: 1, color: colors.onSurface, fontSize: 18, fontWeight: '700' },
  navButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.onSurfaceVariant, fontSize: 12, fontWeight: '600', paddingBottom: space.sm, textTransform: 'capitalize' },
  cell: { flex: 1, height: CELL_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ovulation: { borderWidth: 2, borderColor: colors.fertile, borderStyle: 'solid' },
  selected: { backgroundColor: colors.onSurface },
  selectedOnFill: { borderWidth: 3, borderColor: colors.onSurface, borderStyle: 'solid' },
  todayDot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2 },
  dayText: { color: colors.onSurface, fontSize: 15, fontWeight: '500' },
  todayText: { fontWeight: '800' },
  selectedText: { color: colors.surfaceContainerLowest },
  heart: { position: 'absolute' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.sm, marginTop: space.md, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  swatchPredicted: { borderWidth: 1.5, borderColor: colors.period, borderStyle: 'dashed' },
  swatchOvulation: { borderWidth: 2, borderColor: colors.fertile, backgroundColor: colors.surfaceContainerLowest },
  legendText: { color: colors.onSurfaceVariant, fontSize: 13 },
});

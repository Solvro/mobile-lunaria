import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/Icon';
import { addDays, isoDate, startOfMonth, todayIso, type DayInfo, type DayKind } from '@/cycle';
import { useI18n } from '@/i18n';
import type { WeekStart } from '@/preferences';
import { colors, space } from '@/theme';

export type LegendKey = 'period' | 'predicted' | 'fertile' | 'ovulation' | 'intimacy' | 'today';

// Every day is a circle; its fill says what kind of day it is.
const fills: Record<NonNullable<DayKind>, { background: string; text: string; border?: string }> = {
  period: { background: colors.period, text: colors.onPrimary },
  predicted: { background: colors.periodContainer, text: colors.onPeriodContainer },
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
          circleSize,
        ]}>
          {info.kind === 'predicted' && <Stripes color={colors.expectedPeriod} size={size} />}
          {info.ovulation && <Stripes color={colors.expectedOvulation} size={size} />}
          <Text style={[styles.dayText, fill && { color: fill.text }, isToday && styles.todayText]}>{day.getDate()}</Text>
          {isToday && <View pointerEvents="none" style={[styles.todayRing, isSelected && styles.todayRingInset, { borderRadius: size / 2 }]} />}
          {isSelected && <View pointerEvents="none" style={[styles.selectedRing, { borderRadius: size / 2 }]} />}
        </View>
        {info.intimacy && <View style={[styles.heart, { top: (CELL_HEIGHT + size) / 2 + space.xs }]}><Icon name="heart" size={10} color={colors.error} /></View>}
      </Pressable>;
    })}</View>)}
    {legend.length > 0 && <View style={styles.legend}>{legend.map((key) => <LegendItem key={key} kind={key} label={key === 'today' ? t('common.today') : t(`calendar.${key}`)} />)}</View>}
  </View>;
}

function LegendItem({ kind, label }: { kind: LegendKey; label: string }) {
  const swatch = kind === 'ovulation' || kind === 'intimacy'
    ? styles.swatchOvulation
    : kind === 'today'
      ? styles.swatchToday
      : { backgroundColor: fills[kind].background };
  return <View style={styles.legendItem}>
    {kind === 'intimacy'
      ? <Icon name="heart" size={12} color={colors.error} />
      : <View style={[styles.swatch, swatch]}>{kind === 'predicted' && <Stripes color={colors.expectedPeriod} size={14} />}{kind === 'ovulation' && <Stripes color={colors.expectedOvulation} size={14} />}</View>}
    <Text style={styles.legendText}>{label}</Text>
  </View>;
}

function Stripes({ color, size }: { color: string; size: number }) {
  return <View pointerEvents="none" style={styles.stripeLayer}>{[-size / 2, 0, size / 2, size, size * 1.5].map((top) => <View key={top} style={[styles.stripe, { top, width: size * 2, left: -size / 2, backgroundColor: color }]} />)}</View>;
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
  stripeLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  stripe: { position: 'absolute', height: 2, opacity: 0.7, transform: [{ rotate: '-45deg' }] },
  todayRing: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderWidth: 2, borderColor: colors.calendarToday },
  todayRingInset: { top: 3, right: 3, bottom: 3, left: 3 },
  selectedRing: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderWidth: 3, borderColor: colors.calendarSelected },
  dayText: { color: colors.onSurface, fontSize: 15, fontWeight: '500' },
  todayText: { fontWeight: '800' },
  heart: { position: 'absolute' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: space.sm, marginTop: space.md, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: { width: 14, height: 14, borderRadius: 7, overflow: 'hidden' },
  swatchOvulation: { backgroundColor: colors.fertileContainer },
  swatchToday: { borderWidth: 2, borderColor: colors.calendarToday },
  legendText: { color: colors.onSurfaceVariant, fontSize: 13 },
});

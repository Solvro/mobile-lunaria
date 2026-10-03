import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/api/client';
import type { DailyRecord, Prediction } from '@/api/types';
import { useAuth } from '@/auth';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PodMark } from '@/components/PodMark';
import { colors, shadow } from '@/theme';
import { usePreferences } from '@/preferences';

type Draft = Pick<DailyRecord, 'date' | 'is_period' | 'flow' | 'intimacy' | 'note'>;
const flowLevels: NonNullable<DailyRecord['flow']>[] = ['spotting', 'light', 'medium', 'heavy'];

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addDays(date: Date, days: number) { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; }
function formatMonth(date: Date, locale: string) { return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }); }

export default function Calendar() {
  const { session } = useAuth();
  const { language, weekStart } = usePreferences();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const token = session?.token;
  const monthStart = isoDate(startOfMonth(month));
  const monthEnd = isoDate(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try { const [items, estimate] = await Promise.all([api.records(token, monthStart, monthEnd), api.predictions(token)]); setRecords(items); setPrediction(estimate); }
    catch (error) { Alert.alert('Could not refresh', error instanceof Error ? error.message : 'Try again shortly.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [monthStart, monthEnd, token]);

  async function saveDraft() {
    if (!draft || !token) return;
    try { await api.saveRecord(token, draft); setDraft(null); refresh(); }
    catch (error) { Alert.alert('Could not save', error instanceof Error ? error.message : 'Try again.'); }
  }
  const byDate = new Map(records.map((record) => [record.date, record]));
  const locale = language === 'pl' ? 'pl-PL' : 'en-US';
  const weekdays = weekdayNames(locale, weekStart);
  const firstDayOffset = weekStart === 'monday' ? (month.getDay() + 6) % 7 : month.getDay();
  const days = Array.from({ length: 42 }, (_, index) => addDays(month, index - firstDayOffset));
  const isTodayVisible = month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth();

  return <SafeAreaView style={styles.page} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR CYCLE</Text><Text style={styles.title}>Cycle calendar</Text></View><Pressable onPress={() => router.push('/sharing')} accessibilityLabel="Open sharing"><PodMark size={35} /></Pressable></View>
    <View style={[styles.insight, shadow]}><View><Text style={styles.insightLabel}>NEXT EXPECTED PERIOD</Text><Text style={styles.insightValue}>{prediction ? friendlyDate(prediction.next_period_start, locale) : 'No forecast yet'}</Text><Text style={styles.insightNote}>{prediction ? `${confidenceLabel(prediction.confidence)} confidence` : 'Log your first period day to start building a forecast.'}</Text></View><View style={styles.crescent}><PodMark size={45} /></View></View>
    <View style={styles.calendarCard}><View style={styles.monthHeader}><Pressable hitSlop={12} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Text style={styles.arrow}>‹</Text></Pressable><Text style={styles.month}>{formatMonth(month, locale)}</Text><Pressable hitSlop={12} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Text style={styles.arrow}>›</Text></Pressable></View>
      <View style={styles.grid}>{weekdays.map((day, index) => <Text key={`${day}${index}`} style={styles.weekday}>{day}</Text>)}{days.map((day) => <Day key={isoDate(day)} date={day} inMonth={day.getMonth() === month.getMonth()} record={byDate.get(isoDate(day))} prediction={prediction} onPress={() => setDraft(toDraft(byDate.get(isoDate(day)), isoDate(day)))} />)}</View>
      <View style={styles.legend}><Legend color={colors.rose} label="Logged period" /><Legend color={colors.lavender} label="Estimated" /><Legend color={colors.green} label="Intimacy" /></View>
    </View>
     <Pressable accessibilityRole="button" accessibilityState={{ disabled: isTodayVisible }} disabled={isTodayVisible} onPress={() => setMonth(startOfMonth(new Date()))} style={[styles.today, isTodayVisible && styles.todayDisabled]}><Text style={[styles.todayText, isTodayVisible && styles.todayTextDisabled]}>Return to today</Text></Pressable>
    <View style={styles.disclaimer}><Text style={styles.disclaimerTitle}>Estimates, not instructions</Text><Text style={styles.disclaimerText}>Lunaria uses your recorded history to offer informational estimates. It is not medical advice, contraception, or pregnancy planning guidance.</Text></View>
    {loading && <ActivityIndicator color={colors.plum} style={styles.loading} />}
  </ScrollView><RecordEditor locale={locale} draft={draft} setDraft={setDraft} onSave={saveDraft} onDelete={async () => { const record = draft && byDate.get(draft.date); if (record && token) { await api.deleteRecord(token, record.id); } setDraft(null); refresh(); }} /></SafeAreaView>;
}

function Day({ date, inMonth, record, prediction, onPress }: { date: Date; inMonth: boolean; record?: DailyRecord; prediction: Prediction | null; onPress: () => void }) {
  const iso = isoDate(date); const estimated = prediction && iso >= prediction.next_period_start && iso <= prediction.next_period_end;
  return <Pressable onPress={onPress} style={[styles.day, !inMonth && styles.outside]}><View style={[styles.dayMarker, record?.is_period && styles.periodDay, !record?.is_period && estimated && styles.estimatedDay]} /><Text style={[styles.dayText, record?.is_period && styles.periodText]}>{date.getDate()}</Text>{record?.intimacy && <View style={styles.intimacyDot} />}{prediction?.ovulation_date === iso && <View style={styles.ovulationDot} />}</Pressable>;
}
function Legend({ color, label }: { color: string; label: string }) { return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
function toDraft(record: DailyRecord | undefined, date: string): Draft { return record ? { date, is_period: record.is_period, flow: record.flow, intimacy: record.intimacy, note: record.note } : { date, is_period: false, flow: null, intimacy: false, note: null }; }
function weekdayNames(locale: string, weekStart: 'monday' | 'sunday') { const sunday = new Date(2023, 0, 1); return Array.from({ length: 7 }, (_, index) => addDays(sunday, index + (weekStart === 'monday' ? 1 : 0)).toLocaleDateString(locale, { weekday: 'narrow' })); }
function friendlyDate(date: string, locale?: string) { return new Date(`${date}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' }); }
function confidenceLabel(value: Prediction['confidence']) { return value.replace('_', ' '); }

function RecordEditor({ locale, draft, setDraft, onSave, onDelete }: { locale: string; draft: Draft | null; setDraft: (value: Draft | null) => void; onSave: () => void; onDelete: () => void }) {
  if (!draft) return null;
  return <Modal transparent animationType="slide" onRequestClose={() => setDraft(null)}><Pressable style={styles.backdrop} onPress={() => setDraft(null)} /><View style={styles.sheet}><View style={styles.handle} /><Text style={styles.sheetDate}>{friendlyDate(draft.date, locale)}</Text><View style={styles.toggleRow}><View><Text style={styles.toggleLabel}>Period day</Text><Text style={styles.toggleHint}>Observed information</Text></View><Switch value={draft.is_period} onValueChange={(is_period) => setDraft({ ...draft, is_period, flow: is_period ? draft.flow ?? 'medium' : null })} trackColor={{ true: colors.rose }} /></View>
    {draft.is_period && <View style={styles.flows}>{flowLevels.map((flow) => <Pressable key={flow} onPress={() => setDraft({ ...draft, flow })} style={[styles.flow, draft.flow === flow && styles.selectedFlow]}><Text style={[styles.flowText, draft.flow === flow && styles.selectedFlowText]}>{flow}</Text></Pressable>)}</View>}
    <View style={styles.toggleRow}><View><Text style={styles.toggleLabel}>Intimacy</Text><Text style={styles.toggleHint}>Logged for this day</Text></View><Switch value={draft.intimacy} onValueChange={(intimacy) => setDraft({ ...draft, intimacy })} trackColor={{ true: colors.green }} /></View>
    <TextInput value={draft.note ?? ''} onChangeText={(note) => setDraft({ ...draft, note: note || null })} multiline placeholder="Note (optional)" placeholderTextColor={colors.muted} style={styles.note} />
    <PrimaryButton label="Save day" onPress={onSave} /><Pressable onPress={onDelete}><Text style={styles.clear}>Clear this day</Text></Pressable></View></Modal>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, paddingBottom: 42, gap: 18 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }, eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }, title: { color: colors.plum, fontSize: 29, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  insight: { backgroundColor: colors.plum, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between' }, insightLabel: { color: colors.lavender, fontSize: 11, letterSpacing: 1.2, fontWeight: '700' }, insightValue: { color: colors.cream, fontSize: 22, fontWeight: '700', marginTop: 10 }, insightNote: { color: colors.lavender, fontSize: 13, marginTop: 4, textTransform: 'capitalize' }, crescent: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF12', alignItems: 'center', justifyContent: 'center' },
  calendarCard: { backgroundColor: colors.white, borderRadius: 24, padding: 16, ...shadow }, monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, arrow: { color: colors.plum, fontSize: 30, lineHeight: 32 }, month: { color: colors.plum, fontSize: 17, fontWeight: '700' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.285%', color: colors.muted, textAlign: 'center', fontWeight: '700', fontSize: 11, marginBottom: 8 }, day: { width: '14.285%', height: 42, alignItems: 'center', justifyContent: 'center' }, dayMarker: { position: 'absolute', width: 34, height: 34, borderRadius: 17 }, outside: { opacity: 0.28 }, dayText: { color: colors.text, fontSize: 14, fontWeight: '600' }, periodDay: { backgroundColor: colors.rose }, periodText: { color: colors.white }, estimatedDay: { borderWidth: 1.5, borderColor: colors.lavender, borderStyle: 'dashed' }, intimacyDot: { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.green }, ovulationDot: { position: 'absolute', top: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.plum }, legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, borderTopWidth: 1, borderTopColor: colors.creamMuted, paddingTop: 14, marginTop: 8 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 }, legendDot: { width: 8, height: 8, borderRadius: 4 }, legendText: { color: colors.muted, fontSize: 11 }, today: { minHeight: 40, minWidth: 144, borderWidth: 1, borderColor: colors.plum, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, todayDisabled: { borderColor: colors.border }, todayText: { color: colors.plum, fontWeight: '700', fontSize: 14 }, todayTextDisabled: { color: colors.muted }, disclaimer: { borderLeftColor: colors.lavender, borderLeftWidth: 3, paddingLeft: 12 }, disclaimerTitle: { color: colors.plum, fontWeight: '700', marginBottom: 4 }, disclaimerText: { color: colors.muted, fontSize: 12, lineHeight: 18 }, loading: { marginTop: -14 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#17203388' }, sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, gap: 16 }, handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center' }, sheetDate: { color: colors.plum, fontSize: 22, fontWeight: '700' }, toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, toggleLabel: { color: colors.text, fontSize: 16, fontWeight: '700' }, toggleHint: { color: colors.muted, fontSize: 12, marginTop: 3 }, flows: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, flow: { borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 }, selectedFlow: { backgroundColor: colors.plum, borderColor: colors.plum }, flowText: { color: colors.muted, fontSize: 13, textTransform: 'capitalize' }, selectedFlowText: { color: colors.cream }, note: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, minHeight: 70, color: colors.text, textAlignVertical: 'top' }, clear: { color: colors.muted, textAlign: 'center', padding: 4, fontWeight: '600' },
});

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/api/client';
import type { DailyRecord, PartnerView } from '@/api/types';
import { useAuth } from '@/auth';
import { colors, shadow } from '@/theme';

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
function addDays(date: Date, days: number) { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; }

export default function Partner() {
  const { session } = useAuth();
  const [view, setView] = useState<PartnerView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const today = new Date();
    const start = isoDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const end = isoDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    api.partnerView(session.token, start, end).then(setView).catch((error) => Alert.alert('Could not load shared calendar', error instanceof Error ? error.message : 'Try again shortly.')).finally(() => setLoading(false));
  }, [session]);

  const month = new Date();
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = Array.from({ length: 42 }, (_, index) => addDays(first, index - ((first.getDay() + 6) % 7)));
  const records = new Map(view?.records.map((record) => [record.date, record]));

  return <SafeAreaView style={styles.page} edges={['top']}><ScrollView contentContainerStyle={styles.content}><View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.readOnly}>READ-ONLY</Text></View><Text style={styles.eyebrow}>SHARED CALENDAR</Text><Text style={styles.title}>{view ? `${view.partner.display_name}'s cycle` : 'Partner calendar'}</Text><Text style={styles.intro}>This is the information shared with you. Editing is unavailable here.</Text>
    {loading ? <ActivityIndicator color={colors.plum} /> : <><View style={[styles.insight, shadow]}><Text style={styles.insightLabel}>NEXT EXPECTED PERIOD</Text><Text style={styles.insightValue}>{view?.prediction ? friendlyDate(view.prediction.next_period_start) : 'No estimate yet'}</Text><Text style={styles.insightNote}>Estimates are informational only.</Text></View><View style={[styles.calendar, shadow]}><Text style={styles.month}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Text><View style={styles.grid}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <Text key={`${day}${index}`} style={styles.weekday}>{day}</Text>)}{days.map((day) => <Day key={isoDate(day)} date={day} inMonth={day.getMonth() === month.getMonth()} record={records.get(isoDate(day))} />)}</View></View><View style={styles.boundary}><Text style={styles.boundaryTitle}>Respect the boundary</Text><Text style={styles.boundaryText}>This calendar does not include private notes or intimacy information.</Text></View></>}
  </ScrollView></SafeAreaView>;
}

function Day({ date, inMonth, record }: { date: Date; inMonth: boolean; record?: DailyRecord }) {
  return <View style={[styles.day, !inMonth && styles.outside, record?.is_period && styles.periodDay]}><Text style={[styles.dayText, record?.is_period && styles.periodText]}>{date.getDate()}</Text></View>;
}
function friendlyDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, paddingBottom: 42, gap: 18 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { color: colors.plum, fontSize: 34, lineHeight: 34 }, readOnly: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 6 }, title: { color: colors.plum, fontSize: 29, fontWeight: '700', letterSpacing: -0.5 }, intro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -8 },
  insight: { backgroundColor: colors.plum, borderRadius: 24, padding: 20 }, insightLabel: { color: colors.lavender, fontSize: 11, letterSpacing: 1.2, fontWeight: '700' }, insightValue: { color: colors.cream, fontSize: 22, fontWeight: '700', marginTop: 10 }, insightNote: { color: colors.lavender, fontSize: 13, marginTop: 4 },
  calendar: { backgroundColor: colors.white, borderRadius: 24, padding: 16 }, month: { color: colors.plum, fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 16 }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.285%', color: colors.muted, textAlign: 'center', fontWeight: '700', fontSize: 11, marginBottom: 8 }, day: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16 }, outside: { opacity: 0.28 }, dayText: { color: colors.text, fontSize: 14, fontWeight: '600' }, periodDay: { backgroundColor: colors.rose }, periodText: { color: colors.white },
  boundary: { borderLeftWidth: 3, borderLeftColor: colors.green, paddingLeft: 12 }, boundaryTitle: { color: colors.plum, fontWeight: '700', marginBottom: 4 }, boundaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});

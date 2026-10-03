import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/api/client';
import type { Partner, PartnerRequest, SharingScope } from '@/api/types';
import { useAuth } from '@/auth';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadow } from '@/theme';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function Sharing() {
  const { session, updateAccount } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [savingScope, setSavingScope] = useState<keyof SharingScope | null>(null);
  const token = session?.token;

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [partner, requests] = await Promise.all([api.partner(token), api.partnerRequests(token)]);
      setPartner(partner);
      setPartnerRequests(requests);
    }
    catch (error) { Alert.alert('Could not load sharing', error instanceof Error ? error.message : 'Try again shortly.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  async function createRequest() {
    if (!token || !code.trim()) return;
    setWorking(true);
    try { await api.createPartnerRequest(token, code.trim().toUpperCase()); setCode(''); await load(); }
    catch (error) { Alert.alert('Could not send request', error instanceof Error ? error.message : 'Check the code and try again.'); }
    finally { setWorking(false); }
  }

  async function respondToRequest(request: PartnerRequest, accept: boolean) {
    if (!token) return;
    setWorking(true);
    try {
      if (accept) await api.acceptPartnerRequest(token, request.id);
      else await api.rejectPartnerRequest(token, request.id);
      await load();
    } catch (error) { Alert.alert(`Could not ${accept ? 'accept' : 'reject'} request`, error instanceof Error ? error.message : 'Try again shortly.'); }
    finally { setWorking(false); }
  }

  async function updateScope(key: keyof SharingScope, value: boolean) {
    if (!token || !session) return;
    const scope = { period_days: true, intimacy: true, predictions: true, ...session.account.sharing_scope, [key]: value };
    setSavingScope(key);
    try { await updateAccount(await api.updateSharingScope(token, scope)); }
    catch (error) { Alert.alert('Could not update sharing', error instanceof Error ? error.message : 'Try again shortly.'); }
    finally { setSavingScope(null); }
  }

  function unlink() {
    Alert.alert('Unlink partner?', 'They will no longer be able to view the information you share.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlink', style: 'destructive', onPress: async () => {
        if (!token) return;
        setWorking(true);
        try { await api.unlinkPartner(token); setPartner(null); }
        catch (error) { Alert.alert('Could not unlink partner', error instanceof Error ? error.message : 'Try again shortly.'); }
        finally { setWorking(false); }
      } },
    ]);
  }

  const scope = { period_days: true, intimacy: true, predictions: true, ...session?.account.sharing_scope };
  const incoming = partnerRequests.filter((request) => request.direction === 'incoming');
  const outgoing = partnerRequests.filter((request) => request.direction === 'outgoing');

  return <SafeAreaView style={styles.page} edges={['top']}><ScrollView contentContainerStyle={styles.content}><View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Pressable onPress={() => router.push('/settings')}><Text style={styles.settings}>Settings</Text></Pressable></View><Text style={styles.eyebrow}>SHARING</Text><Text style={styles.title}>On your terms.</Text><Text style={styles.intro}>A linked partner can only see the cycle information you choose to share. They cannot edit your records.</Text>
    <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>YOUR LINK CODE</Text><Text selectable style={styles.code}>{session?.account.partner_link_code}</Text><Text style={styles.note}>Share this code privately. A partner can send you a request, which you must accept before linking.</Text></View>
    {loading ? <ActivityIndicator color={colors.plum} /> : <>{partner ? <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>LINKED PARTNER</Text><Text style={styles.partnerName}>{partner.display_name}</Text><Text style={styles.note}>Their view is read-only and contains no private notes.</Text><PrimaryButton label="View shared calendar" onPress={() => router.push('/partner')} /><Pressable onPress={unlink} disabled={working}><Text style={styles.unlink}>{working ? 'Working...' : 'Unlink partner'}</Text></Pressable></View> : <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>SEND A REQUEST</Text><Text style={styles.note}>Enter a partner's private code. They must accept before either of you is linked.</Text><TextInput value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder="Partner's code" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Partner link code" /><PrimaryButton label={working ? 'Sending...' : 'Send request'} onPress={createRequest} disabled={!code.trim() || working} /></View>}
      {incoming.map((request) => <View key={request.id} style={[styles.card, shadow]}><Text style={styles.cardLabel}>INCOMING REQUEST</Text><Text style={styles.partnerName}>{request.partner.display_name}</Text><Text style={styles.note}>Accepting creates a shared, read-only connection.</Text><PrimaryButton label={working ? 'Working...' : 'Accept request'} onPress={() => respondToRequest(request, true)} disabled={working} /><Pressable onPress={() => respondToRequest(request, false)} disabled={working}><Text style={styles.unlink}>Reject request</Text></Pressable></View>)}
      {outgoing.map((request) => <View key={request.id} style={[styles.pendingCard, shadow]}><Text style={styles.cardLabel}>REQUEST SENT</Text><Text style={styles.partnerName}>{request.partner.display_name}</Text><Text style={styles.note}>Waiting for them to accept your request.</Text></View>)}
      <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>WHAT YOU SHARE</Text><ScopeRow label="Period days" hint="Whether a day is logged as a period day" value={scope.period_days} saving={savingScope === 'period_days'} onChange={(value) => updateScope('period_days', value)} /><ScopeRow label="Intimacy" hint="Whether intimacy is logged for a day" value={scope.intimacy} saving={savingScope === 'intimacy'} onChange={(value) => updateScope('intimacy', value)} /><ScopeRow label="Predictions" hint="Cycle estimate dates" value={scope.predictions} saving={savingScope === 'predictions'} onChange={(value) => updateScope('predictions', value)} /><Text style={styles.note}>Private notes and flow level are never shared.</Text></View></>}
    <View style={styles.boundary}><Text style={styles.boundaryTitle}>Private by default</Text><Text style={styles.boundaryText}>Your notes and flow level stay private. Linked views are read-only.</Text></View>
   </ScrollView><BottomNavigation active="sharing" /></SafeAreaView>;
}

function ScopeRow({ label, hint, value, saving, onChange }: { label: string; hint: string; value: boolean; saving: boolean; onChange: (value: boolean) => void }) {
  return <View style={styles.scopeRow}><View><Text style={styles.scopeLabel}>{label}</Text><Text style={styles.scopeHint}>{hint}</Text></View><Switch value={value} onValueChange={onChange} disabled={saving} trackColor={{ true: colors.green }} /></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, paddingBottom: 42, gap: 18 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { color: colors.plum, fontSize: 34, lineHeight: 34 }, settings: { color: colors.plum, fontWeight: '700' },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 6 }, title: { color: colors.plum, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 }, intro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -8 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 14 }, pendingCard: { backgroundColor: colors.creamMuted, borderRadius: 24, padding: 20, gap: 10 }, cardLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }, code: { color: colors.plum, fontSize: 28, letterSpacing: 4, fontWeight: '700' }, partnerName: { color: colors.plum, fontSize: 22, fontWeight: '700' }, note: { color: colors.muted, fontSize: 13, lineHeight: 19 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, color: colors.text, fontSize: 16, letterSpacing: 1 }, unlink: { color: colors.rose, textAlign: 'center', fontWeight: '700', padding: 5 }, scopeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.creamMuted, paddingTop: 12 }, scopeLabel: { color: colors.text, fontSize: 15, fontWeight: '700' }, scopeHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  boundary: { borderLeftWidth: 3, borderLeftColor: colors.green, paddingLeft: 12 }, boundaryTitle: { color: colors.plum, fontWeight: '700', marginBottom: 4 }, boundaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});

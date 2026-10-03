import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/api/client';
import type { Partner } from '@/api/types';
import { useAuth } from '@/auth';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, shadow } from '@/theme';

export default function Sharing() {
  const { session } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const token = session?.token;

  async function load() {
    if (!token) return;
    setLoading(true);
    try { setPartner(await api.partner(token)); }
    catch (error) { Alert.alert('Could not load sharing', error instanceof Error ? error.message : 'Try again shortly.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  async function link() {
    if (!token || !code.trim()) return;
    setWorking(true);
    try { setPartner(await api.linkPartner(token, code.trim().toUpperCase())); setCode(''); }
    catch (error) { Alert.alert('Could not link partner', error instanceof Error ? error.message : 'Check the code and try again.'); }
    finally { setWorking(false); }
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

  return <SafeAreaView style={styles.page} edges={['top']}><ScrollView contentContainerStyle={styles.content}><View style={styles.top}><Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.back}>‹</Text></Pressable><Pressable onPress={() => router.push('/settings')}><Text style={styles.settings}>Settings</Text></Pressable></View><Text style={styles.eyebrow}>SHARING</Text><Text style={styles.title}>On your terms.</Text><Text style={styles.intro}>A linked partner can only see the cycle information you choose to make available. They cannot edit your records.</Text>
    <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>YOUR LINK CODE</Text><Text selectable style={styles.code}>{session?.account.partner_link_code}</Text><Text style={styles.note}>Share this code privately. A partner enters it from their own Lunaria account.</Text></View>
    {loading ? <ActivityIndicator color={colors.plum} /> : partner ? <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>LINKED PARTNER</Text><Text style={styles.partnerName}>{partner.display_name}</Text><Text style={styles.note}>Their view is read-only and contains no private notes.</Text><PrimaryButton label="View shared calendar" onPress={() => router.push('/partner')} /><Pressable onPress={unlink} disabled={working}><Text style={styles.unlink}>{working ? 'Working...' : 'Unlink partner'}</Text></Pressable></View> : <View style={[styles.card, shadow]}><Text style={styles.cardLabel}>LINK A PARTNER</Text><Text style={styles.note}>Enter the private code your partner shared with you. You can unlink at any time.</Text><TextInput value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder="Partner's code" placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel="Partner link code" /><PrimaryButton label={working ? 'Linking...' : 'Link partner'} onPress={link} disabled={!code.trim() || working} /></View>}
    <View style={styles.boundary}><Text style={styles.boundaryTitle}>Private by default</Text><Text style={styles.boundaryText}>Your notes and intimacy details stay private. Linked views are read-only.</Text></View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { padding: 20, paddingBottom: 42, gap: 18 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { color: colors.plum, fontSize: 34, lineHeight: 34 }, settings: { color: colors.plum, fontWeight: '700' },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 6 }, title: { color: colors.plum, fontSize: 30, fontWeight: '700', letterSpacing: -0.5 }, intro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -8 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 14 }, cardLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }, code: { color: colors.plum, fontSize: 28, letterSpacing: 4, fontWeight: '700' }, partnerName: { color: colors.plum, fontSize: 22, fontWeight: '700' }, note: { color: colors.muted, fontSize: 13, lineHeight: 19 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, color: colors.text, fontSize: 16, letterSpacing: 1 }, unlink: { color: colors.rose, textAlign: 'center', fontWeight: '700', padding: 5 },
  boundary: { borderLeftWidth: 3, borderLeftColor: colors.green, paddingLeft: 12 }, boundaryTitle: { color: colors.plum, fontWeight: '700', marginBottom: 4 }, boundaryText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});

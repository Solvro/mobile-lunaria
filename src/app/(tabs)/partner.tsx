import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/api/client';
import type { PartnerRequest, SharingScope } from '@/api/types';
import { useAuth } from '@/auth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { SharedCalendar } from '@/components/SharedCalendar';
import { useI18n } from '@/i18n';
import { usePartnerLink } from '@/partnerLink';
import { colors, radius, typography } from '@/theme';

const scopeKeys: (keyof SharingScope)[] = ['period_days', 'predictions', 'intimacy'];

export default function PartnerTab() {
  const { session, tracksCycle, updateAccount } = useAuth();
  const { partner, requests, loaded, reload, setPartner } = usePartnerLink();
  const { t, locale } = useI18n();
  const [code, setCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [working, setWorking] = useState(false);
  const [showMyCode, setShowMyCode] = useState(false);
  const [retryCode, setRetryCode] = useState(false);
  const [savingScope, setSavingScope] = useState<keyof SharingScope | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const token = session?.token;
  const myCode = session?.account.partner_link_code ?? '';

  async function load() {
    try { await reload(); }
    catch (error) { Alert.alert(t('partner.loadFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
  }

  useFocusEffect(useCallback(() => { reload().catch(() => {}); }, [reload]));

  async function refresh() {
    setRefreshing(true);
    setRefreshKey((key) => key + 1);
    await load();
    setRefreshing(false);
  }

  async function sendRequest() {
    if (!token || !code.trim()) return;
    setWorking(true);
    try { await api.createPartnerRequest(token, code.trim().toUpperCase()); setCode(''); await load(); }
    catch (error) { Alert.alert(t('partner.sendFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
    finally { setWorking(false); }
  }

  async function respond(request: PartnerRequest, accept: boolean) {
    if (!token) return;
    setWorking(true);
    try {
      if (accept) await api.acceptPartnerRequest(token, request.id);
      else await api.rejectPartnerRequest(token, request.id);
      await load();
    } catch (error) { Alert.alert(t('partner.respondFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
    finally { setWorking(false); }
  }

  async function updateScope(key: keyof SharingScope, value: boolean) {
    if (!token) return;
    setSavingScope(key);
    try { await updateAccount(await api.updateSharingScope(token, { ...scope, [key]: value })); }
    catch (error) { Alert.alert(t('partner.scopeFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
    finally { setSavingScope(null); }
  }

  function unlink() {
    Alert.alert(t('partner.unlinkTitle'), t('partner.unlinkBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('partner.unlink'), style: 'destructive', onPress: async () => {
        if (!token) return;
        setWorking(true);
        try { await api.unlinkPartner(token); setPartner(null); }
        catch (error) { Alert.alert(t('partner.unlinkFailed'), error instanceof Error ? error.message : t('common.tryAgain')); }
        finally { setWorking(false); }
      } },
    ]);
  }

  const scope: SharingScope = { period_days: true, intimacy: false, predictions: true, ...session?.account.sharing_scope };
  const incoming = requests.filter((request) => request.direction === 'incoming');
  const outgoing = requests.filter((request) => request.direction === 'outgoing');
  const title = partner && !tracksCycle ? partner.display_name : t('partner.title');

  const codeEntry = <View style={styles.codeEntry}>
    <TextInput
      value={code}
      onChangeText={setCode}
      autoCapitalize="characters"
      autoCorrect={false}
      placeholder={t('partner.enterCode')}
      placeholderTextColor={colors.muted}
      style={styles.input}
      accessibilityLabel={t('partner.enterCode')}
      returnKeyType="send"
      onSubmitEditing={sendRequest}
    />
    <Button label={t('partner.send')} onPress={sendRequest} disabled={!code.trim()} loading={working} />
  </View>;

  const myCodeBlock = <View style={styles.codeBox}>
    <View style={styles.codeText}>
      <Text style={typography.label}>{t('partner.yourCode')}</Text>
      <Text selectable style={styles.code}>{myCode}</Text>
    </View>
    <Pressable onPress={() => Share.share({ message: t('partner.shareMessage', { code: myCode }) })} style={styles.shareButton} accessibilityRole="button" accessibilityLabel={t('partner.shareCode')}>
      <Icon name="share" size={18} color={colors.primary} />
      <Text style={styles.shareText}>{t('partner.shareCode')}</Text>
    </Pressable>
  </View>;

  return <Screen title={title} refreshing={refreshing} onRefresh={refresh}>
    {incoming.map((request) => <Card key={request.id} style={styles.requestCard}>
      <Text style={typography.heading}>{t('partner.incoming', { name: request.partner.display_name })}</Text>
      <Text style={typography.caption}>{tracksCycle ? t('partner.incomingTrackerBody') : t('partner.incomingFollowerBody')}</Text>
      <View style={styles.buttonRow}>
        <View style={styles.flex}><Button label={t('partner.reject')} variant="secondary" onPress={() => respond(request, false)} disabled={working} /></View>
        <View style={styles.flex}><Button label={t('partner.accept')} onPress={() => respond(request, true)} loading={working} /></View>
      </View>
    </Card>)}

    {!loaded ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : partner ? <>
      {!tracksCycle && <SharedCalendar refreshKey={refreshKey} />}
      <Card>
        <View style={styles.linkedRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{partner.display_name.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.flex}>
            <Text style={typography.bodyStrong}>{partner.display_name}</Text>
            <Text style={styles.connected}>{t('partner.connected')}</Text>
          </View>
        </View>
        {tracksCycle && <Text style={typography.caption}>{t('partner.linkedTrackerBody', { name: partner.display_name })}</Text>}
      </Card>
      {tracksCycle && <ScopeCard scope={scope} saving={savingScope} onChange={updateScope} />}
      <Button label={t('partner.unlink')} variant="ghost" onPress={unlink} disabled={working} />
    </> : <>
      {outgoing.map((request) => <Card key={request.id} style={styles.pendingCard}>
        <View style={styles.pendingIcon}><Icon name="partner" size={18} color={colors.fertileText} /></View>
        <View style={styles.flex}>
          <Text style={typography.bodyStrong}>{t('partner.pending', { name: request.partner.display_name })}</Text>
          <Text style={typography.caption}>{t('partner.sentOn', { date: new Date(request.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) })}</Text>
        </View>
      </Card>)}
      {!tracksCycle && outgoing.length > 0 && (retryCode ? <Card>{codeEntry}</Card> : <Button label={t('partner.otherCode')} variant="ghost" onPress={() => setRetryCode(true)} />)}
      {tracksCycle ? <>
        <Card>
          <Text style={typography.heading}>{t('partner.inviteTitle')}</Text>
          <Text style={typography.caption}>{t('partner.inviteBody')}</Text>
          {myCodeBlock}
          <Text style={[typography.label, styles.or]}>{t('partner.orEnterCode')}</Text>
          {codeEntry}
        </Card>
        <ScopeCard scope={scope} saving={savingScope} onChange={updateScope} />
      </> : outgoing.length === 0 && <Card>
        <Text style={typography.heading}>{t('partner.connectTitle')}</Text>
        <Text style={typography.caption}>{t('partner.connectBody')}</Text>
        {codeEntry}
        {showMyCode
          ? myCodeBlock
          : <Button label={t('partner.showMyCode')} variant="ghost" onPress={() => setShowMyCode(true)} />}
      </Card>}
    </>}
  </Screen>;
}

function ScopeCard({ scope, saving, onChange }: { scope: SharingScope; saving: keyof SharingScope | null; onChange: (key: keyof SharingScope, value: boolean) => void }) {
  const { t } = useI18n();
  return <Card style={styles.scopeCard}>
    <Text style={typography.heading}>{t('partner.scopeTitle')}</Text>
    {scopeKeys.map((key) => <View key={key} style={styles.scopeRow}>
      <View style={styles.flex}>
        <Text style={typography.bodyStrong}>{t(`partner.scope.${key}`)}</Text>
        <Text style={typography.caption}>{t(`partner.scope.${key}Hint`)}</Text>
      </View>
      <Switch value={scope[key]} onValueChange={(value) => onChange(key, value)} disabled={saving === key} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.surface} accessibilityLabel={t(`partner.scope.${key}`)} />
    </View>)}
    <View style={styles.privateNote}><Icon name="lock" size={14} color={colors.muted} /><Text style={[typography.caption, styles.flex]}>{t('partner.alwaysPrivate')}</Text></View>
  </Card>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { marginVertical: 32 },
  requestCard: { borderWidth: 1.5, borderColor: colors.primary },
  buttonRow: { flexDirection: 'row', gap: 10 },
  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.fertileSoft },
  pendingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.fertileSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.fertileText, fontSize: 18, fontWeight: '700' },
  connected: { color: colors.fertileText, fontSize: 13, fontWeight: '600' },
  codeEntry: { gap: 10 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, minHeight: 52, paddingHorizontal: 14, color: colors.text, fontSize: 18, letterSpacing: 2, fontWeight: '600' },
  codeBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  codeText: { flex: 1, gap: 2 },
  code: { color: colors.text, fontSize: 26, letterSpacing: 4, fontWeight: '800' },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface },
  shareText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  or: { marginTop: 6 },
  scopeCard: { gap: 12 },
  scopeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  privateNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

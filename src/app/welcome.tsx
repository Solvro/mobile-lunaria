import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import { useAuth } from '@/auth';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { PodMark } from '@/components/PodMark';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/preferences';
import { colors, radius, typography } from '@/theme';

type Step = 'choose' | 'register' | 'signin';

export default function Welcome() {
  const { signIn, register } = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('choose');
  const [tracksCycle, setTracksCycle] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [working, setWorking] = useState(false);

  function choose(tracks: boolean) {
    setTracksCycle(tracks);
    setStep('register');
  }

  async function submit() {
    const isNew = step === 'register';
    if (!email.trim() || !password || (isNew && !name.trim())) return Alert.alert(t('welcome.missing'), t('welcome.missingBody'));
    setWorking(true);
    try {
      if (isNew) {
        const session = await register(name.trim(), email.trim(), password, tracksCycle);
        if (!tracksCycle && partnerCode.trim()) {
          await api.createPartnerRequest(session.token, partnerCode.trim().toUpperCase())
            .catch(() => Alert.alert(t('welcome.requestFailed'), t('welcome.requestFailedBody')));
        }
      } else {
        await signIn(email.trim(), password);
      }
      router.replace('/');
    } catch (error) {
      Alert.alert(t('welcome.failed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setWorking(false);
    }
  }

  return <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          {step === 'choose'
            ? <View style={styles.brand}><PodMark size={30} /><Text style={styles.brandName}>lunaria</Text></View>
            : <Pressable onPress={() => setStep('choose')} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={8}><Icon name="back" size={18} /></Pressable>}
          <LanguageSwitch />
        </View>

        {step === 'choose' ? <>
          <View style={styles.hero}>
            <Text style={typography.display}>{t('welcome.tagline')}</Text>
            <Text style={[typography.body, styles.muted]}>{t('welcome.question')}</Text>
          </View>
          <View style={styles.choices}>
            <ModeCard icon="drop" accent={colors.period} title={t('welcome.tracker.title')} body={t('welcome.tracker.body')} onPress={() => choose(true)} />
            <ModeCard icon="partner" accent={colors.fertile} title={t('welcome.follower.title')} body={t('welcome.follower.body')} onPress={() => choose(false)} />
          </View>
          <View style={styles.footer}>
            <Button label={t('welcome.haveAccount')} variant="ghost" onPress={() => setStep('signin')} />
            <Text style={styles.disclaimer}>{t('welcome.disclaimer')}</Text>
          </View>
        </> : <>
          <Text style={typography.title}>{step === 'register' ? t('welcome.registerTitle') : t('welcome.signInTitle')}</Text>
          {step === 'register' && <Pressable onPress={() => setStep('choose')} style={styles.modePill} accessibilityRole="button" accessibilityHint={t('welcome.change')}>
            <Icon name={tracksCycle ? 'drop' : 'partner'} size={16} color={tracksCycle ? colors.period : colors.fertile} />
            <Text style={styles.modePillText}>{tracksCycle ? t('welcome.tracker.title') : t('welcome.follower.title')}</Text>
            <Text style={styles.modePillChange}>{t('welcome.change')}</Text>
          </Pressable>}
          <View style={styles.form}>
            {step === 'register' && <Field label={t('welcome.name')} value={name} onChangeText={setName} autoCapitalize="words" textContentType="givenName" autoComplete="given-name" />}
            <Field label={t('welcome.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" autoComplete="email" />
            <Field label={t('welcome.password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType={step === 'register' ? 'newPassword' : 'password'} autoComplete={step === 'register' ? 'new-password' : 'current-password'} />
            {step === 'register' && !tracksCycle && <Field label={t('welcome.partnerCode')} hint={t('welcome.partnerCodeHint')} value={partnerCode} onChangeText={setPartnerCode} autoCapitalize="characters" autoCorrect={false} />}
          </View>
          {step === 'register' && <Pressable onPress={() => setConsent((value) => !value)} style={styles.consentRow} accessibilityRole="checkbox" accessibilityState={{ checked: consent }}>
            <View style={[styles.checkbox, consent && styles.checkboxOn]}>{consent && <Icon name="check" size={14} color={colors.onPrimary} />}</View>
            <Text style={styles.consent}>{t('welcome.consent')}</Text>
          </Pressable>}
          <Button label={step === 'register' ? t('welcome.create') : t('welcome.signIn')} onPress={submit} loading={working} disabled={step === 'register' && !consent} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function ModeCard({ icon, accent, title, body, onPress }: { icon: IconName; accent: string; title: string; body: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${title}. ${body}`}>
    <View style={[styles.modeIcon, { backgroundColor: accent }]}><Icon name={icon} size={22} color={colors.onPrimary} /></View>
    <View style={styles.modeText}>
      <Text style={typography.heading}>{title}</Text>
      <Text style={typography.caption}>{body}</Text>
    </View>
    <Icon name="forward" size={16} color={colors.muted} />
  </Pressable>;
}

function LanguageSwitch() {
  const { language, setLanguage } = usePreferences();
  return <View style={styles.language} accessibilityRole="radiogroup">
    {(['pl', 'en'] as const).map((code) => <Pressable key={code} onPress={() => setLanguage(code)} style={[styles.languageOption, language === code && styles.languageActive]} accessibilityRole="radio" accessibilityState={{ selected: language === code }} hitSlop={4}>
      <Text style={[styles.languageText, language === code && styles.languageTextActive]}>{code.toUpperCase()}</Text>
    </Pressable>)}
  </View>;
}

function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return <View style={styles.field}>
    <Text style={typography.label}>{label}</Text>
    <TextInput {...props} placeholderTextColor={colors.muted} style={styles.input} accessibilityLabel={label} accessibilityHint={hint} />
    {hint && <Text style={styles.hint}>{hint}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, gap: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontSize: 20, letterSpacing: 1.5, color: colors.primary, fontWeight: '700' },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  hero: { gap: 12, marginTop: 24 },
  muted: { color: colors.muted },
  choices: { gap: 12 },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  modeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modeText: { flex: 1, gap: 4 },
  footer: { marginTop: 'auto', gap: 8 },
  disclaimer: { color: colors.muted, textAlign: 'center', fontSize: 12, lineHeight: 17 },
  modePill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: -8 },
  modePillText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  modePillChange: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  form: { gap: 14 },
  field: { gap: 6 },
  input: { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, minHeight: 52, paddingHorizontal: 14, fontSize: 16 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  consentRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  consent: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  language: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, padding: 3 },
  languageOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  languageActive: { backgroundColor: colors.surface },
  languageText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  languageTextActive: { color: colors.text },
});

import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/auth';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PodMark } from '@/components/PodMark';
import { colors } from '@/theme';

export default function Welcome() {
  const { signIn, register } = useAuth();
  const [isNew, setIsNew] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [working, setWorking] = useState(false);

  async function submit() {
    if (!email || !password || (isNew && !name)) return Alert.alert('Complete the form', 'Please add the fields marked above.');
    setWorking(true);
    try {
      if (isNew) await register(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      router.replace('/calendar');
    } catch (error) {
      Alert.alert('Unable to continue', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setWorking(false);
    }
  }

  return <SafeAreaView style={styles.page} edges={['top', 'bottom']}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
    <View style={styles.brand}><PodMark size={54} /><Text style={styles.name}>lunaria</Text></View>
    <View><Text style={styles.heading}>{isNew ? 'Your cycle, held privately.' : 'Welcome back.'}</Text><Text style={styles.intro}>A quiet place for your own record, with sharing only when you choose.</Text></View>
    <View style={styles.form}>
      {isNew && <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
      {isNew && <Text style={styles.consent}>By creating an account, you accept the Terms, Privacy Policy, and processing of the information needed to run Lunaria. You can delete your data at any time.</Text>}
      <PrimaryButton label={working ? 'One moment...' : isNew ? 'Create private space' : 'Sign in'} onPress={submit} disabled={working} />
    </View>
    <Pressable onPress={() => setIsNew((value) => !value)} accessibilityRole="button"><Text style={styles.switch}>{isNew ? 'Already have an account? Sign in' : 'New here? Create an account'}</Text></Pressable>
    <Text style={styles.disclaimer}>Cycle estimates are informational only and are not medical advice or contraception guidance.</Text>
  </KeyboardAvoidingView></SafeAreaView>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; keyboardType?: 'email-address'; autoCapitalize?: 'none' | 'words' }) {
  return <View><Text style={styles.fieldLabel}>{props.label}</Text><TextInput {...props} placeholderTextColor="#958B98" style={styles.input} accessibilityLabel={props.label} /></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.plum }, content: { flex: 1, justifyContent: 'space-between', padding: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 }, name: { fontSize: 22, letterSpacing: 2, color: colors.cream, fontWeight: '600' },
  heading: { color: colors.cream, fontSize: 36, lineHeight: 43, fontWeight: '700', letterSpacing: -1 }, intro: { color: colors.lavender, fontSize: 16, lineHeight: 24, marginTop: 12, maxWidth: 315 },
  form: { gap: 14 }, fieldLabel: { color: colors.lavender, marginBottom: 7, fontSize: 14, fontWeight: '600' }, input: { backgroundColor: '#FFF9F014', color: colors.cream, borderColor: '#D8C5E655', borderWidth: 1, borderRadius: 14, minHeight: 50, paddingHorizontal: 14, fontSize: 16 },
  consent: { color: colors.lavender, fontSize: 12, lineHeight: 18, marginVertical: 2 }, switch: { color: colors.cream, fontSize: 15, textAlign: 'center', fontWeight: '600' }, disclaimer: { color: '#B7AABB', textAlign: 'center', fontSize: 11, lineHeight: 16 },
});

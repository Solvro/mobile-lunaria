import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api/client';
import type { Account, Session } from './api/types';

const tracksCycleKey = (accountId: string) => `lunaria.tracks-cycle.${accountId}`;

type AuthState = {
  session: Session | null;
  ready: boolean;
  tracksCycle: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, tracksCycle: boolean) => Promise<Session>;
  updateAccount: (account: Account) => Promise<void>;
  setTracksCycle: (value: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Prefer the server's value; fall back to the choice remembered on this device.
async function withTracksCycle(session: Session, chosen?: boolean): Promise<Session> {
  const key = tracksCycleKey(session.account.id);
  if (chosen !== undefined) await AsyncStorage.setItem(key, String(chosen));
  const stored = await AsyncStorage.getItem(key);
  const tracks_cycle = session.account.tracks_cycle ?? chosen ?? (stored === null ? true : stored === 'true');
  return { ...session, account: { ...session.account, tracks_cycle } };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.restoreSession()
      .then((saved) => (saved ? withTracksCycle(saved) : null))
      .then(setSession)
      .finally(() => setReady(true));
  }, []);

  async function store(next: Session) {
    await api.saveSession(next);
    setSession(next);
    return next;
  }

  return <AuthContext value={{
    session,
    ready,
    tracksCycle: session?.account.tracks_cycle ?? true,
    signIn: async (email, password) => {
      const signedIn = await api.signIn(email, password);
      // New device and the API doesn't know the mode: someone linked to a partner with no
      // period data of their own is almost certainly only following.
      const known = signedIn.account.tracks_cycle !== undefined || (await AsyncStorage.getItem(tracksCycleKey(signedIn.account.id))) !== null;
      const prediction = !known && signedIn.account.linked_partner_id ? await api.predictions(signedIn.token).catch(() => undefined) : undefined;
      const guess = prediction === undefined ? undefined : prediction !== null;
      await store(await withTracksCycle(signedIn, guess));
    },
    register: async (name, email, password, tracksCycle) => store(await withTracksCycle(await api.register(name, email, password, tracksCycle), tracksCycle)),
    updateAccount: async (account) => {
      if (!session) return;
      await store({ ...session, account: { ...account, tracks_cycle: account.tracks_cycle ?? session.account.tracks_cycle } });
    },
    setTracksCycle: async (value) => {
      if (!session) return;
      await store(await withTracksCycle(session, value).then((next) => ({ ...next, account: { ...next.account, tracks_cycle: value } })));
    },
    signOut: async () => { await api.clearSession(); setSession(null); },
  }}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

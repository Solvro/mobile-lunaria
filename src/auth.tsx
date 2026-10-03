import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api/client';
import type { Account, Session } from './api/types';

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

// Migrate sessions created before usage mode was stored by the API.
async function withTracksCycle(session: Session, chosen?: boolean): Promise<Session> {
  const tracks_cycle = session.account.tracks_cycle ?? chosen ?? true;
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
      await store(await withTracksCycle(signedIn));
    },
    register: async (name, email, password, tracksCycle) => store(await withTracksCycle(await api.register(name, email, password, tracksCycle), tracksCycle)),
    updateAccount: async (account) => {
      if (!session) return;
      await store({ ...session, account: { ...account, tracks_cycle: account.tracks_cycle ?? session.account.tracks_cycle } });
    },
    setTracksCycle: async (value) => {
      if (!session) return;
      const account = await api.updateUsageMode(session.token, value);
      await store({ ...session, account });
    },
    signOut: async () => { await api.clearSession(); setSession(null); },
  }}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

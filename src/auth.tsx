import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api/client';
import type { Session } from './api/types';

type AuthState = {
  session: Session | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.restoreSession().then(setSession).finally(() => setReady(true));
  }, []);

  return <AuthContext value={{
    session,
    ready,
    signIn: async (email, password) => setSession(await api.signIn(email, password)),
    register: async (name, email, password) => setSession(await api.register(name, email, password)),
    signOut: async () => { await api.clearSession(); setSession(null); },
  }}>{children}</AuthContext>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

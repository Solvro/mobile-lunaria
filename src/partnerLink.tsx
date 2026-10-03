import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api/client';
import type { Partner, PartnerRequest } from './api/types';
import { useAuth } from './auth';

type PartnerLinkState = {
  partner: Partner | null;
  requests: PartnerRequest[];
  loaded: boolean;
  reload: () => Promise<void>;
  setPartner: (partner: Partner | null) => void;
};

const PartnerLinkContext = createContext<PartnerLinkState | null>(null);

// Poll faster while our own request waits, so the screen flips as soon as it is accepted.
const PENDING_POLL_MS = 15_000;
const IDLE_POLL_MS = 60_000;

export function PartnerLinkProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const token = session?.token;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!token) return;
    const [linked, pending] = await Promise.all([api.partner(token), api.partnerRequests(token)]);
    setPartner(linked);
    setRequests(pending);
    setLoaded(true);
  }, [token]);

  const waiting = !partner && requests.some((request) => request.direction === 'outgoing');

  useEffect(() => {
    reload().catch(() => {});
    const timer = setInterval(() => reload().catch(() => {}), waiting ? PENDING_POLL_MS : IDLE_POLL_MS);
    return () => clearInterval(timer);
  }, [reload, waiting]);

  return <PartnerLinkContext value={{ partner, requests, loaded, reload, setPartner }}>{children}</PartnerLinkContext>;
}

export function usePartnerLink() {
  const value = useContext(PartnerLinkContext);
  if (!value) throw new Error('usePartnerLink must be used within PartnerLinkProvider');
  return value;
}

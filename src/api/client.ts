import * as SecureStore from 'expo-secure-store';
import type { Account, DailyRecord, Partner, PartnerRequest, PartnerView, Prediction, Session, SharingScope } from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const SESSION_KEY = 'lunaria.session';

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Something went wrong.' }));
    throw new Error(body.message ?? 'Something went wrong.');
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  async restoreSession() {
    const saved = await SecureStore.getItemAsync(SESSION_KEY);
    return saved ? (JSON.parse(saved) as Session) : null;
  },
  async clearSession() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
  async saveSession(session: Session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },
  async signIn(email: string, password: string) {
    const session = await request<Session>('/v1/auth/sign-in', { method: 'POST', body: JSON.stringify({ email, password }) });
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  async register(display_name: string, email: string, password: string) {
    const session = await request<Session>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ display_name, email, password, accept_terms: true, accept_privacy: true, accept_data_processing: true }),
    });
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  records(token: string, start: string, end: string) {
    return request<DailyRecord[]>(`/v1/records?start=${start}&end=${end}`, {}, token);
  },
  saveRecord(token: string, record: Omit<DailyRecord, 'id'>) {
    return request<DailyRecord>('/v1/records', { method: 'PUT', body: JSON.stringify(record) }, token);
  },
  deleteRecord(token: string, id: string) {
    return request<void>(`/v1/records/${id}`, { method: 'DELETE' }, token);
  },
  predictions(token: string) {
    return request<Prediction>('/v1/predictions', {}, token);
  },
  partner(token: string) {
    return request<Partner | null>('/v1/partner', {}, token);
  },
  partnerRequests(token: string) {
    return request<PartnerRequest[]>('/v1/partner/requests', {}, token);
  },
  createPartnerRequest(token: string, code: string) {
    return request<PartnerRequest>('/v1/partner/requests', { method: 'POST', body: JSON.stringify({ code }) }, token);
  },
  acceptPartnerRequest(token: string, requestId: string) {
    return request<Partner>(`/v1/partner/requests/${requestId}/accept`, { method: 'POST' }, token);
  },
  rejectPartnerRequest(token: string, requestId: string) {
    return request<void>(`/v1/partner/requests/${requestId}/reject`, { method: 'POST' }, token);
  },
  unlinkPartner(token: string) {
    return request<void>('/v1/partner/link', { method: 'DELETE' }, token);
  },
  partnerView(token: string, start: string, end: string) {
    return request<PartnerView>(`/v1/partner/records?start=${start}&end=${end}`, {}, token);
  },
  updateSharingScope(token: string, scope: SharingScope) {
    return request<Account>('/v1/partner/sharing-scope', { method: 'PUT', body: JSON.stringify(scope) }, token);
  },
  deleteCycleData(token: string) {
    return request<void>('/v1/account/cycle-data', { method: 'DELETE' }, token);
  },
  deleteAccount(token: string) {
    return request<void>('/v1/account', { method: 'DELETE' }, token);
  },
};

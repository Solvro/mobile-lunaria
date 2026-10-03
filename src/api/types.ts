export type Account = {
  id: string;
  email: string;
  display_name: string;
  partner_link_code: string;
  linked_partner_id: string | null;
  agreements_accepted: boolean;
  sharing_scope?: SharingScope;
  // Whether this person keeps their own calendar or only follows a partner's.
  // Not yet stored by the API, so the app falls back to a per-account local value.
  tracks_cycle?: boolean;
};

export type Session = { token: string; account: Account };

export type DailyRecord = {
  id: string;
  date: string;
  is_period: boolean;
  flow: 'spotting' | 'light' | 'medium' | 'heavy' | null;
  intimacy: boolean;
  note: string | null;
};

export type Prediction = {
  next_period_start: string;
  next_period_end: string;
  predicted_ovulation_date: string;
  fertile_window_start: string;
  fertile_window_end: string;
  average_cycle_length: number;
  average_period_duration: number;
  current_cycle_day: number | null;
  confidence: 'very_low' | 'low' | 'medium' | 'high';
};

export type Partner = {
  id: string;
  display_name: string;
};

export type SharingScope = {
  period_days: boolean;
  intimacy: boolean;
  predictions: boolean;
};

export type PartnerRequest = {
  id: string;
  partner: Partner;
  direction: 'incoming' | 'outgoing';
  created_at: string;
};

// Fields the owner doesn't share are omitted by the API.
export type SharedDailyRecord = Pick<DailyRecord, 'date'> & Partial<Pick<DailyRecord, 'is_period' | 'intimacy'>>;

export type PartnerView = {
  partner: Partner;
  records: SharedDailyRecord[];
  prediction: Prediction | null;
};

export type DataExport = {
  account: Account;
  records: DailyRecord[];
};

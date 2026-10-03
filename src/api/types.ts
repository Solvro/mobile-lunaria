export type Account = {
  id: string;
  email: string;
  display_name: string;
  partner_link_code: string;
  linked_partner_id: string | null;
  agreements_accepted: boolean;
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
  ovulation_date: string;
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

export type PartnerView = {
  partner: Partner;
  records: DailyRecord[];
  prediction: Prediction | null;
};

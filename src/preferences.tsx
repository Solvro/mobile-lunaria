import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const LANGUAGE_KEY = 'lunaria.language';
const WEEK_START_KEY = 'lunaria.week-start';

export type Language = 'en' | 'pl';
export type WeekStart = 'monday' | 'sunday';

type PreferencesState = {
  ready: boolean;
  language: Language;
  weekStart: WeekStart;
  setLanguage: (language: Language) => Promise<void>;
  setWeekStart: (weekStart: WeekStart) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesState | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'pl';
}

function isWeekStart(value: string | null): value is WeekStart {
  return value === 'monday' || value === 'sunday';
}

function deviceLanguage(): Language {
  return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(deviceLanguage);
  const [weekStart, setWeekStartState] = useState<WeekStart>('monday');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([LANGUAGE_KEY, WEEK_START_KEY])
      .then(([[, storedLanguage], [, storedWeekStart]]) => {
        if (isLanguage(storedLanguage)) setLanguageState(storedLanguage);
        if (isWeekStart(storedWeekStart)) setWeekStartState(storedWeekStart);
      })
      .finally(() => setReady(true));
  }, []);

  async function setLanguage(language: Language) {
    setLanguageState(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  }

  async function setWeekStart(weekStart: WeekStart) {
    setWeekStartState(weekStart);
    await AsyncStorage.setItem(WEEK_START_KEY, weekStart);
  }

  return <PreferencesContext value={{ ready, language, weekStart, setLanguage, setWeekStart }}>{children}</PreferencesContext>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used within PreferencesProvider');
  return value;
}

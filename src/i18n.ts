import type { Language } from './preferences';

const strings = {
  calendar: ['Cycle calendar', 'Kalendarz cyklu'],
  yourCycle: ['YOUR CYCLE', 'TWÓJ CYKL'],
  nextExpectedPeriod: ['NEXT EXPECTED PERIOD', 'NASTĘPNA MIESIĄCZKA'],
  noForecastYet: ['No forecast yet', 'Brak prognozy'],
  forecastZeroState: ['Log your first period day to start building a forecast.', 'Zapisz pierwszy dzień miesiączki, aby utworzyć prognozę.'],
  confidence: ['confidence', 'pewność'],
  loggedPeriod: ['Logged period', 'Zapisana miesiączka'],
  estimated: ['Estimated', 'Prognoza'],
  intimacy: ['Intimacy', 'Współżycie'],
  returnToToday: ['Return to today', 'Wróć do dzisiaj'],
  estimatesNotInstructions: ['Estimates, not instructions', 'Prognozy, nie zalecenia'],
  estimateDisclaimer: ['Lunaria uses your recorded history to offer informational estimates. It is not medical advice, contraception, or pregnancy planning guidance.', 'Lunaria wykorzystuje zapisaną historię do tworzenia prognoz informacyjnych. Nie jest to porada medyczna, antykoncepcyjna ani dotycząca planowania ciąży.'],
  settings: ['Settings', 'Ustawienia'],
  sharing: ['Sharing', 'Udostępnianie'],
  calendarTab: ['Calendar', 'Kalendarz'],
  yourSettings: ['Your settings', 'Twoje ustawienia'],
  language: ['Language', 'Język'],
  english: ['English', 'Angielski'],
  polish: ['Polish', 'Polski'],
  calendarSettings: ['Calendar', 'Kalendarz'],
  weekStartDescription: ['Choose the first day of your calendar week.', 'Wybierz pierwszy dzień tygodnia w kalendarzu.'],
  monday: ['Monday', 'Poniedziałek'],
  sunday: ['Sunday', 'Niedziela'],
  account: ['Account', 'Konto'],
  signOut: ['Sign out', 'Wyloguj się'],
  deleteData: ['Delete data', 'Usuń dane'],
  deleteDataDescription: ['These actions cannot be undone.', 'Tych działań nie można cofnąć.'],
  deleteCycleData: ['Delete cycle data', 'Usuń dane cyklu'],
  deleteAccount: ['Delete account', 'Usuń konto'],
} as const;

export type TranslationKey = keyof typeof strings;

export function translate(language: Language, key: TranslationKey) {
  return strings[key][language === 'pl' ? 1 : 0];
}

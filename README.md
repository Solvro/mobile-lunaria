# Lunaria

Lunaria to otwarta aplikacja mobilna do prywatnego śledzenia cyklu. Umożliwia zapisywanie miesiączki, intensywności krwawienia, intymności i prywatnych notatek, a także prezentuje wyraźnie oznaczone, niemedyczne prognozy. Połączony partner widzi wyłącznie wybrany przez właścicielkę danych zakres w trybie tylko do odczytu.

## Uruchomienie z produkcyjnym API

Wymagania: Node.js 22.13 lub nowszy, aplikacja Expo Go na telefonie albo emulator iOS/Android.

```bash
git clone https://github.com/Solvro/mobile-lunaria.git
cd mobile-lunaria
npm install
npm run start:production
```

Zeskanuj kod QR w Expo Go albo wybierz emulator w terminalu. Polecenie `start:production` ustawia `EXPO_PUBLIC_API_URL` na `https://lunaria-api.b.solvro.pl`.

## Wersja przeglądarkowa

```bash
git clone https://github.com/Solvro/mobile-lunaria.git
cd mobile-lunaria
npm install
npm run web
```

Polecenie `npm run web` również korzysta z produkcyjnego API. Aby połączyć aplikację z własnym backendem, uruchom Expo z jego adresem:

```bash
EXPO_PUBLIC_API_URL=https://api.twoja-domena.pl npm run web
```

## Samodzielne hostowanie

Backend oraz landing page są publikowane w osobnych repozytoriach:

- [backend-lunaria](https://github.com/Solvro/backend-lunaria) zawiera API, PostgreSQL i instrukcję wdrożenia.
- [web-lunaria](https://github.com/Solvro/web-lunaria) zawiera statyczną stronę projektu.

Po wdrożeniu własnego API podaj jego publiczny adres jako `EXPO_PUBLIC_API_URL` podczas uruchamiania lub budowania aplikacji.

## Zasady projektu

- Bez reklam, subskrypcji i ukrytych opłat za podstawowe śledzenie cyklu oraz prognozy.
- Partner widzi tylko wybrany zakres danych; notatki i szczegóły krwawienia nie są udostępniane.
- Dane można wyeksportować albo usunąć z aktywnej bazy aplikacji.

## Zastrzeżenie

Prognozy mają charakter wyłącznie informacyjny. Lunaria nie udziela porady medycznej, nie służy jako antykoncepcja ani narzędzie do planowania ciąży i nie zastępuje opieki specjalistycznej.

## Zespół

Solvro Londyn: Konrad Guzek, Kamil Marczak, Michał Gęs, Bartosz Gotowski, Dawid Linek i Dominika Stefaniak.

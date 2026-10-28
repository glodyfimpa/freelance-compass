# Freelance Compass

[English](README.md) · **Italiano**

Advisor per sviluppatori freelance italiani in regime forfettario. Compili un form di 7 passi
(tra cui ruolo, stack, anni di esperienza, tariffa giornaliera, obiettivo) e ricevi tre blocchi:

- **Benchmark di mercato**: dove si colloca la tua tariffa rispetto al tuo ruolo e alla tua seniority.
- **Analisi del netto reale**: quanto ti resta davvero dopo INPS e imposta sostitutiva.
- **Piano di transizione**: passi concreti per alzare la tariffa o passare a una consulenza a valore.

## Come funziona

I conti fiscali li fa il codice e l'analisi la fa il modello, così il modello non inventa i numeri.

```
Form (7 passi) → lib/calculator.ts (calcolo deterministico)
              → /api/analyze → Claude (streaming) → pagina risultati (3 blocchi)
```

- `lib/calculator.ts` calcola il netto forfettario: coefficiente ATECO (67% o 78%), INPS gestione
  separata al 26,07%, imposta sostitutiva al 5% nei primi 5 anni e al 15% dopo, tetto di 85.000 €.
  Arrotonda al centesimo a ogni passaggio intermedio.
- `lib/prompt.ts` passa a Claude i numeri già calcolati: il modello li commenta, non li ricalcola.
- Quando il coefficiente ATECO è ambiguo (es. frontend senza codice noto), il calcolo produce
  entrambi gli scenari.

## Stack

Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS 4, Anthropic SDK.
Test con Vitest e Testing Library, scritti in TDD: 155 test su calcolatore, prompt, parser dello
streaming, API route e form.

## Avvio in locale

Serve Node 20.9 o superiore e una chiave API Anthropic.

```bash
npm install
echo "ANTHROPIC_API_KEY=..." > .env.local
npm run dev
```

Altri comandi: `npm test`, `npm run lint`, `npm run build`.

## Limiti

Copre solo il regime forfettario, non l'ordinario. I numeri fiscali sono un'indicazione per
ragionare sulla tariffa, non una consulenza fiscale.

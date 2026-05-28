---
tipo: resource
created: 2026-05-26
slug: prd
---

# Freelance Compass — Product Requirements Document

## Overview

Web app AI-native che analizza il profilo di un freelancer IT italiano in regime forfettario e restituisce tre output: benchmark tariffe di mercato, calcolo netto reale, piano di transizione da body rental a consulente a valore.

Costruita in 16 ore all'hackathon SuperAgents di Play New / Cosmico (27-28 febbraio 2026, Milano).

## Target User

Freelancer IT italiani con partita IVA in regime forfettario (developer, DevOps, data engineer) che lavorano principalmente in body rental o come contractor e non hanno mai calcolato con precisione il proprio netto reale ne verificato dove si posizionano rispetto al mercato.

**Bisogno:** capire in 5 minuti se sta lasciando soldi sul tavolo. Non vuole un corso, non vuole un commercialista. Vuole sapere quanto vale sul mercato, quanto gli rimane in tasca dopo INPS e imposta sostitutiva, e cosa fare concretamente per cambiare situazione.

## Scope — Cosa NON fare

Vincoli espliciti per le 16 ore di hackathon:

- No account utente, no persistenza, no sharing
- No regime ordinario (solo forfettario 5% e 15%)
- No design system custom (Tailwind defaults)
- No ottimizzazione prompt infinita il Day 1 — prima funziona il pipeline, si raffina il Day 2

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **AI:** Anthropic SDK, claude-sonnet-4-5 (streaming)
- **Deploy:** Vercel — URL pubblico, nessuna autenticazione, stateless puro

## Architecture

```
Form multi-step (7 step)
  -> calcolo netto deterministico (TypeScript)
  -> API Route /api/analyze (numeri pre-calcolati + profilo utente)
  -> claude-sonnet-4-5 (streaming)
  -> Results page
```

### Principio architetturale: math deterministica, AI interpretativa

Il calcolo fiscale (Blocco 2) avviene in TypeScript, non nell'LLM. La formula del netto e aritmetica pura — delegarla a Claude introdurrebbe rischio di allucinazione su dati finanziari. Claude riceve i numeri gia calcolati e si occupa di:

- **Blocco 1:** interpretare il benchmark e posizionare il profilo (task AI-appropriate)
- **Blocco 2:** narrare e contestualizzare i numeri pre-calcolati (zero rischio allucinazione sui dati)
- **Blocco 3:** generare il piano di transizione personalizzato (task AI-appropriate)

### File Structure

```
freelance-compass/
├── app/
│   ├── page.tsx                <- Form multi-step
│   ├── results/page.tsx        <- Pagina risultati
│   └── api/analyze/route.ts    <- Calcolo deterministico + chiamata Anthropic
├── lib/
│   ├── calculator.ts           <- Formula netto forfettario (deterministico)
│   ├── prompt.ts               <- System prompt + builder
│   └── types.ts                <- Tipi TypeScript
└── components/
    ├── FormStep.tsx
    └── ResultBlock.tsx
```

## Input — 7 Step (8 Domande)

### Step 1: Ruolo + Stack
- **Ruolo** (obbligatorio): dropdown — Backend Developer, Frontend Developer, Fullstack, DevOps/SRE, Data Engineer/ML, Altro
- **Stack tecnologico** (opzionale): dropdown — Java/Spring, Python (Django/FastAPI), Node.js, .NET/C#, Go/Rust, PHP, React/Vue/Angular (frontend), Kubernetes/Terraform/Cloud (DevOps), Python ML/PyTorch/TF (Data), Altro

**Nota:** il ruolo definisce la categoria di mercato e il benchmark. Lo stack e un segnale contestuale che raffina il posizionamento dentro la fascia (es. Java/Spring top della fascia backend per enterprise/banking, Go/Rust top per scarsita profili, PHP basso del range).

### Step 2: Anni di esperienza
Campo numerico. Min: 0, max: 50.

### Step 3: Tariffa giornaliera attuale
Campo numerico in euro/giorno. Min: 50, max: 2000.

### Step 4: Regime fiscale
Radio: forfettario 5% (primi 5 anni), forfettario 15% (dal 6 anno).

### Step 5: Giorni fatturati medi al mese
Campo numerico. Min: 1, max: 23.

### Step 6: Codice ATECO
Toggle con due opzioni:
- **"Conosco il mio codice ATECO"** -> campo libero (es. `62.20.10`)
- **"Non lo so"** -> nessun campo, deduzione nel calcolo in base al ruolo

Il toggle e gestito con `useState` booleano in React.

### Step 7: Obiettivo principale
Radio/select: aumentare tariffa, trovare clienti migliori, uscire dal body rental, ottimizzare il netto

### Validazione

| Campo | Min | Max | Note |
|---|---|---|---|
| Anni di esperienza | 0 | 50 | Intero |
| Tariffa giornaliera | 50 | 2000 | Euro/giorno |
| Giorni fatturati/mese | 1 | 23 | Giorni lavorativi |

## Output — 3 Blocchi

### Formato streaming

Claude ritorna markdown con marcatori di sezione. Il frontend splitta la risposta su questi marcatori e renderizza ogni blocco separatamente:

```
## BENCHMARK DI MERCATO
[contenuto blocco 1]

## ANALISI NETTO REALE
[contenuto blocco 2]

## PIANO DI TRANSIZIONE
[contenuto blocco 3]
```

### Blocco 1 — Benchmark di mercato (generato da AI)

Posizionamento rispetto ai pari. Mostra:
- Fascia di mercato specifica per ruolo e seniority (es. "Backend Senior: 400-550/gg")
- Tariffa attuale posizionata dentro la fascia
- Effetto dello stack sul posizionamento dentro la fascia
- Delta geografico Milano/Nord-Ovest con disclaimer (se rilevante)
- Impatto canale body rental vs diretto (se rilevante)

Solo posizionamento, niente consigli.

### Blocco 2 — Analisi netto reale (numeri pre-calcolati, narrati da AI)

I numeri sono calcolati in `lib/calculator.ts` e passati a Claude come contesto. Claude li presenta e contestualizza senza ricalcolarli.

Mostra:
1. Calcolo netto attuale (tariffa e giorni dichiarati) con formula step-by-step
2. Calcolo netto a tariffa obiettivo (fascia superiore o target)
3. Delta netto annuo in euro concreti
4. Coefficiente ATECO usato e fonte (fornito o dedotto)

Per Frontend Developer senza ATECO: due calcoli paralleli (67% codice vs 78% CMS/grafica).

### Blocco 3 — Piano di transizione (generato da AI)

3 azioni concrete, sequenziali, calibrate sull'obiettivo dichiarato.

Regole:
- Ogni azione e specifica: chi contattare, cosa pubblicare, quale piattaforma, quale messaggio
- Ordine temporale: cosa fare prima, cosa dopo
- Output verificabile per ogni azione (es. "2 DM inviati", "1 post pubblicato")
- No consigli generici tipo "ottimizza il tuo profilo LinkedIn"

### UX streaming

Durante la chiamata API (10-30 secondi):
- Mostrare rendering progressivo del testo (streaming)
- Ogni blocco appare man mano che il testo arriva
- Skeleton/placeholder per i blocchi non ancora ricevuti

## Domain Data

### Formula netto forfettario (implementata in lib/calculator.ts)

```typescript
const redditoLordo = fatturato * coefficiente;
const inps = redditoLordo * 0.2607;
const imponibile = redditoLordo - inps;
const imposta = imponibile * aliquota;
const netto = fatturato - inps - imposta;
```

Dove:
- `fatturato` = tariffa giornaliera * giorni fatturati al mese * 12
- `coefficiente` = coefficiente di redditivita ATECO (0.67 o 0.78)
- `aliquota` = 0.05 (primi 5 anni) o 0.15 (dal 6 anno)

Fonti:
- INPS gestione separata: 26,07% (Circolare INPS n.27 del 30/01/2025)
- Aliquota alternativa: 24% per pensionati o iscritti ad altra previdenza obbligatoria
- Soglia forfettario: 85.000 euro fatturato annuo

### Coefficienti di redditivita ATECO

Regime transitorio D.L. n.81/2025 (tabella L. 190/2014, aggiornata L. 145/2018).

| Ruolo | Codice ATECO | Coefficiente |
|---|---|---|
| Backend / Fullstack Developer (consulenza) | 62.20.10 | 67% |
| Backend / Fullstack Developer (solo execution) | 62.10.00 | 67% |
| DevOps / SRE / Data Engineer | 62.20.10 o 62.10.00 | 67% |
| Frontend Developer (React/Vue/Angular) | 62.10.00 | 67% |
| Frontend Developer (WordPress/Webflow/CMS) | 74.12.01 | 78% |
| IT strategy / management consultant | 70.22.09 | 78% |

### Logica deduzione ATECO (in lib/calculator.ts)

Se l'utente non fornisce il codice:
- Backend, Fullstack, DevOps, Data Engineer -> `62.20.10` -> 67%
- Frontend Developer -> caso ambiguo: calcolare entrambi e passare a Claude per presentazione parallela
- IT strategy consultant -> `70.22.09` -> 78%
- Altro -> `62.20.10` -> 67% con disclaimer

Il coefficiente dedotto va sempre mostrato con nota: "Coefficiente basato su ATECO [codice] dedotto dall'attivita descritta — verificare con il proprio commercialista."

### Benchmark tariffe IT Italia

Fonti: LiberiPro community survey 2025, Upwork/Fiverr Italia 2024, Bitboss State of Development Italy.
Tariffe IVA escluse, contatto diretto con cliente finale. Tramite body rental: sottrarre 20-40%.

**Media generale: 283 euro/gg** (LiberiPro 2025)

| Ruolo | Junior (0-2y) | Mid (3-5y) | Senior (6+y) |
|---|---|---|---|
| Backend Developer | 200-280 | 300-380 | 400-550 |
| Frontend Developer | 180-250 | 260-330 | 350-480 |
| Fullstack Developer | 200-270 | 270-350 | 380-520 |
| DevOps / SRE / Cloud | 250-320 | 350-430 | 450-600 |
| Data Engineer / ML | 230-300 | 330-420 | 440-600 |

Note:
- Backend piu alto di Fullstack: media Backend 323/gg vs Fullstack 230/gg (LiberiPro). Backend puro serve enterprise/banking.
- DevOps e Data sopra la media per scarsita profili.
- Specializzazioni verticali (fintech, healthtech, AI): +25-30% vs generalisti.
- Delta geografico: Nord-Ovest (Milano) +15-25% — dato non verificato, usare disclaimer.
- Campione LiberiPro piccolo (17 osservazioni backend, 8-15 altri ruoli) ma reale e specifico.

## System Prompt

Vedi `lib/prompt.ts` per il system prompt completo. Principi chiave:
- Tono diretto, numerico, concreto
- Ogni affermazione accompagnata da un numero o riferimento specifico
- Niente consigli generici
- Claude riceve i numeri del Blocco 2 pre-calcolati — non deve ricalcolarli
- Output in markdown con marcatori `## BENCHMARK DI MERCATO`, `## ANALISI NETTO REALE`, `## PIANO DI TRANSIZIONE`
- Disclaimer: non costituisce consulenza fiscale, verificare con commercialista abilitato

## Test Scenario — Golden Path

**Input:**
- Ruolo: Backend Developer
- Stack: Java/Spring
- Anni esperienza: 6
- Tariffa: 350 euro/giorno
- Regime: forfettario 15%
- Giorni/mese: 18
- ATECO: 62.20.10
- Obiettivo: aumentare tariffa

**Output atteso:**
- Blocco 1: fascia Senior 400-550/gg, posizionamento sotto la fascia senior, Java/Spring top della fascia per contesti enterprise/banking
- Blocco 2: fatturato 75.600 euro, reddito lordo 50.652 euro, INPS 13.204,98 euro, imponibile 37.447,02 euro, imposta 5.617,05 euro, netto 56.777,97 euro. Delta con tariffa 450/gg mostrato.
- Blocco 3: 3 azioni specifiche per aumentare tariffa (non generiche)

## Timeline — 16 ore

### Day 1 — 27 febbraio
- 10-12: setup Next.js + form multi-step con validazione
- 12-14: lib/calculator.ts (deterministico) + API route + Anthropic SDK streaming
- 14-16: results page con splitting blocchi + rendering progressivo
- 16-18: test end-to-end con golden path

### Day 2 — 28 febbraio
- 10-12: system prompt raffinato su casi edge (frontend ATECO, "Altro")
- 12-14: UI polishing, responsive mobile
- 14-16: deploy Vercel, test profili diversi
- 16-18: buffer + preparazione demo

## Strategia Pitch

| Angolo | Messaggio |
|---|---|
| Posizionamento | "Calcolatore con career insights AI-powered", non "AI che da consigli fiscali" |
| Trust | Math deterministica per i numeri + AI per la personalizzazione |
| Distribuzione | Cosmico ha 35K freelancer italiani. Audience built-in |
| Autenticita | Il founder e il target user. Bisogno personale reale |
| Blue Ocean | Zero concorrenza nell'intersezione freelancer IT italiano + forfettario + benchmark + piano d'azione |

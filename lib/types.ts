// ============================================================
// Freelance Compass - Type Definitions
// ============================================================

// --- Enums / Union Types ---

export type Ruolo =
  | "backend"
  | "frontend"
  | "fullstack"
  | "devops"
  | "data"
  | "altro";

export type Stack =
  | "java-spring"
  | "python"
  | "nodejs"
  | "dotnet"
  | "go-rust"
  | "php"
  | "react-vue-angular"
  | "kubernetes-terraform"
  | "python-ml"
  | "altro";

export type RegimeFiscale = "forfettario5" | "forfettario15";

export type Obiettivo =
  | "aumentare-tariffa"
  | "trovare-clienti"
  | "uscire-body-rental"
  | "ottimizzare-netto";

/** Derived from anniEsperienza: 0-2 junior, 3-5 mid, 6+ senior */
export type SeniorityBand = "junior" | "mid" | "senior";

// --- Interfaces ---

export interface FormData {
  ruolo: Ruolo;
  /** Optional: tech stack detail */
  stack?: Stack;
  anniEsperienza: number;
  /** Tariffa giornaliera in EUR */
  tariffaGiornaliera: number;
  regime: RegimeFiscale;
  giorniFatturatiMese: number;
  /** true se l'utente conosce il proprio codice ATECO */
  atecoConosciuto: boolean;
  /** Presente solo quando atecoConosciuto === true */
  codiceAteco?: string;
  obiettivo: Obiettivo;
}

/** Risultato della deduzione/validazione del codice ATECO */
export interface InfoATECO {
  /** e.g. "62.01.00" */
  codice: string;
  /** Coefficiente di redditivita: 0.67 o 0.78 */
  coefficiente: number;
  /** true se il codice e stato dedotto automaticamente */
  dedotto: boolean;
  /** Spiegazione leggibile della scelta ATECO */
  nota: string;
}

/** Output deterministico del calcolatore netto - tutti i passaggi intermedi */
export interface CalcoloNetto {
  /** tariffaGiornaliera * giorniFatturatiMese * 12 */
  fatturato: number;
  /** Coefficiente di redditivita applicato */
  coefficiente: number;
  /** fatturato * coefficiente */
  redditoLordo: number;
  /** Contributi INPS calcolati */
  inps: number;
  /** Reddito imponibile dopo INPS */
  imponibile: number;
  /** 0.05 per forfettario5, 0.15 per forfettario15 */
  aliquota: number;
  /** imponibile * aliquota */
  imposta: number;
  /** Netto finale dopo imposta e INPS */
  netto: number;
  infoAteco: InfoATECO;
}

export interface CalcoloNettoResult {
  /** Calcolo basato sulla tariffa attuale dell'utente */
  calcoloAttuale: CalcoloNetto;
  /** Calcolo basato sulla tariffa obiettivo derivata dal benchmark */
  calcoloObiettivo: CalcoloNetto;
  /** calcoloObiettivo.netto - calcoloAttuale.netto */
  deltaNetto: number;
  /** Presente per Frontend con ATECO ambiguo (coefficiente 78%) */
  calcoloAlternativo?: CalcoloNetto;
}

/** Payload inviato alla API route per l'analisi AI */
export interface AnalysisRequest {
  formData: FormData;
  calcoloNetto: CalcoloNettoResult;
}

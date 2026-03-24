"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Ruolo,
  Stack,
  RegimeFiscale,
  Obiettivo,
  FormData,
} from "@/lib/types";

const TOTAL_STEPS = 3;

const STEP_LABELS: Record<number, string> = {
  1: "Chi sei",
  2: "I tuoi numeri",
  3: "Il tuo obiettivo",
};

const RUOLO_OPTIONS: { value: Ruolo; label: string; desc: string }[] = [
  { value: "backend", label: "Backend Developer", desc: "API, microservizi, database" },
  { value: "frontend", label: "Frontend Developer", desc: "UI, React, Vue, Angular" },
  { value: "fullstack", label: "Fullstack Developer", desc: "End-to-end development" },
  { value: "devops", label: "DevOps/SRE/Cloud", desc: "Infrastruttura, CI/CD, cloud" },
  { value: "data", label: "Data Engineer/ML", desc: "Pipeline dati, ML, analytics" },
  { value: "altro", label: "Altro", desc: "Ruolo non in lista" },
];

const STACK_OPTIONS: { value: Stack; label: string }[] = [
  { value: "java-spring", label: "Java/Spring" },
  { value: "python", label: "Python (Django/FastAPI)" },
  { value: "nodejs", label: "Node.js" },
  { value: "dotnet", label: ".NET/C#" },
  { value: "go-rust", label: "Go/Rust" },
  { value: "php", label: "PHP" },
  { value: "react-vue-angular", label: "React/Vue/Angular" },
  { value: "kubernetes-terraform", label: "Kubernetes/Terraform/Cloud" },
  { value: "python-ml", label: "Python ML/PyTorch/TF" },
  { value: "altro", label: "Altro" },
];

const OBIETTIVO_OPTIONS: { value: Obiettivo; label: string; desc: string; icon: string }[] = [
  { value: "aumentare-tariffa", label: "Aumentare la tariffa", desc: "Scopri quanto potresti chiedere", icon: "\u2191" },
  { value: "trovare-clienti", label: "Trovare clienti migliori", desc: "Posizionati per clienti diretti", icon: "\u{1F3AF}" },
  { value: "uscire-body-rental", label: "Uscire dal body rental", desc: "Piano per lavorare in proprio", icon: "\u{1F680}" },
  { value: "ottimizzare-netto", label: "Ottimizzare il netto", desc: "Massimizza il tuo guadagno reale", icon: "\u{1F4B0}" },
];

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [ruolo, setRuolo] = useState<Ruolo | "">("");
  const [stack, setStack] = useState<Stack | "">("");
  const [anniEsperienza, setAnniEsperienza] = useState<number | "">("");
  const [tariffaGiornaliera, setTariffaGiornaliera] = useState<number | "">("");
  const [regime, setRegime] = useState<RegimeFiscale | "">("");
  const [giorniFatturatiMese, setGiorniFatturatiMese] = useState<number | "">("");
  const [atecoConosciuto, setAtecoConosciuto] = useState(false);
  const [codiceAteco, setCodiceAteco] = useState("");
  const [obiettivo, setObiettivo] = useState<Obiettivo | "">("");

  function validateCurrentStep(): boolean {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!ruolo) newErrors.ruolo = "Seleziona un ruolo";
        if (anniEsperienza === "") {
          newErrors.anniEsperienza = "Inserisci gli anni di esperienza";
        } else if (anniEsperienza < 0 || anniEsperienza > 50) {
          newErrors.anniEsperienza = "Il valore deve essere tra 0 e 50";
        }
        break;
      case 2:
        if (tariffaGiornaliera === "") {
          newErrors.tariffaGiornaliera = "Inserisci la tariffa giornaliera";
        } else if (tariffaGiornaliera < 50 || tariffaGiornaliera > 2000) {
          newErrors.tariffaGiornaliera = "Il valore deve essere tra 50 e 2000";
        }
        if (!regime) newErrors.regime = "Seleziona il regime fiscale";
        if (giorniFatturatiMese === "") {
          newErrors.giorniFatturatiMese = "Inserisci i giorni fatturati";
        } else if (giorniFatturatiMese < 1 || giorniFatturatiMese > 23) {
          newErrors.giorniFatturatiMese = "Il valore deve essere tra 1 e 23";
        }
        break;
      case 3:
        if (!obiettivo) newErrors.obiettivo = "Seleziona un obiettivo";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  function handleSubmit() {
    if (!validateCurrentStep()) return;

    const formData: FormData = {
      ruolo: ruolo as Ruolo,
      anniEsperienza: anniEsperienza as number,
      tariffaGiornaliera: tariffaGiornaliera as number,
      regime: regime as RegimeFiscale,
      giorniFatturatiMese: giorniFatturatiMese as number,
      atecoConosciuto,
      obiettivo: obiettivo as Obiettivo,
    };

    if (stack) formData.stack = stack as Stack;
    if (atecoConosciuto && codiceAteco) formData.codiceAteco = codiceAteco;

    sessionStorage.setItem("freelance-compass-data", JSON.stringify(formData));
    router.push("/results");
  }

  const inputClasses =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-base text-[var(--foreground)] placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors";
  const selectClasses = inputClasses + " appearance-none cursor-pointer";
  const labelClasses = "block text-sm font-medium text-slate-600 mb-2";
  const errorClasses = "mt-2 text-sm text-[var(--error)]";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Freelance Compass
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Quanto dovresti guadagnare davvero?
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step < currentStep
                      ? "bg-[var(--primary)] text-white"
                      : step === currentStep
                        ? "bg-[var(--primary)] text-white"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {step < currentStep ? "\u2713" : step}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    step <= currentStep ? "text-[var(--foreground)]" : "text-slate-400"
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
              <div className="h-1 rounded-full bg-slate-200">
                <div
                  className="h-1 rounded-full bg-[var(--primary)] transition-all duration-500"
                  style={{
                    width: step < currentStep ? "100%" : step === currentStep ? "50%" : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
          <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
            {STEP_LABELS[currentStep]}
          </h2>

          {/* Step 1: Chi sei */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label className={labelClasses}>Qual è il tuo ruolo?</label>
                <div className="grid grid-cols-2 gap-3">
                  {RUOLO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRuolo(opt.value)}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${
                        ruolo === opt.value
                          ? "border-[var(--primary)] bg-blue-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-[var(--foreground)]">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-[var(--muted)] mt-0.5">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.ruolo && <p className={errorClasses}>{errors.ruolo}</p>}
              </div>

              <div>
                <label htmlFor="stack" className={labelClasses}>
                  Stack tecnologico <span className="text-slate-400">(opzionale)</span>
                </label>
                <select
                  id="stack"
                  value={stack}
                  onChange={(e) => setStack(e.target.value as Stack)}
                  className={selectClasses}
                >
                  <option value="">Seleziona lo stack</option>
                  {STACK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="anniEsperienza" className={labelClasses}>
                  Anni di esperienza
                </label>
                <input
                  id="anniEsperienza"
                  type="number"
                  min="0"
                  max="50"
                  value={anniEsperienza}
                  onChange={(e) =>
                    setAnniEsperienza(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={inputClasses}
                  placeholder="es. 6"
                />
                {errors.anniEsperienza && (
                  <p className={errorClasses}>{errors.anniEsperienza}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: I tuoi numeri */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label htmlFor="tariffaGiornaliera" className={labelClasses}>
                  Tariffa giornaliera
                </label>
                <div className="relative">
                  <input
                    id="tariffaGiornaliera"
                    type="number"
                    min="50"
                    max="2000"
                    value={tariffaGiornaliera}
                    onChange={(e) =>
                      setTariffaGiornaliera(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className={inputClasses + " pr-16"}
                    placeholder="es. 350"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    EUR/gg
                  </span>
                </div>
                {errors.tariffaGiornaliera && (
                  <p className={errorClasses}>{errors.tariffaGiornaliera}</p>
                )}
              </div>

              <div>
                <label className={labelClasses}>Regime fiscale</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegime("forfettario5")}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                      regime === "forfettario5"
                        ? "border-[var(--primary)] bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-lg font-bold text-[var(--foreground)]">5%</span>
                    <span className="block text-xs text-[var(--muted)]">Primi 5 anni</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegime("forfettario15")}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                      regime === "forfettario15"
                        ? "border-[var(--primary)] bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-lg font-bold text-[var(--foreground)]">15%</span>
                    <span className="block text-xs text-[var(--muted)]">Dal 6° anno</span>
                  </button>
                </div>
                {errors.regime && <p className={errorClasses}>{errors.regime}</p>}
              </div>

              <div>
                <label htmlFor="giorniFatturatiMese" className={labelClasses}>
                  Giorni fatturati al mese
                </label>
                <input
                  id="giorniFatturatiMese"
                  type="number"
                  min="1"
                  max="23"
                  value={giorniFatturatiMese}
                  onChange={(e) =>
                    setGiorniFatturatiMese(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className={inputClasses}
                  placeholder="es. 18"
                />
                {errors.giorniFatturatiMese && (
                  <p className={errorClasses}>{errors.giorniFatturatiMese}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <input
                    id="atecoConosciuto"
                    type="checkbox"
                    checked={atecoConosciuto}
                    onChange={(e) => setAtecoConosciuto(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer"
                  />
                  <label htmlFor="atecoConosciuto" className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
                    Conosco il mio codice ATECO
                  </label>
                </div>
                {atecoConosciuto && (
                  <div className="mt-3">
                    <input
                      id="codiceAteco"
                      type="text"
                      value={codiceAteco}
                      onChange={(e) => setCodiceAteco(e.target.value)}
                      className={inputClasses}
                      placeholder="es. 62.01.00"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Obiettivo */}
          {currentStep === 3 && (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              <div className="space-y-3">
                {OBIETTIVO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setObiettivo(opt.value)}
                    className={`cursor-pointer w-full rounded-xl border-2 p-4 text-left transition-all flex items-center gap-4 ${
                      obiettivo === opt.value
                        ? "border-[var(--primary)] bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <span className="block text-base font-semibold text-[var(--foreground)]">
                        {opt.label}
                      </span>
                      <span className="block text-sm text-[var(--muted)]">
                        {opt.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.obiettivo && <p className={errorClasses}>{errors.obiettivo}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              >
                Indietro
              </button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 shadow-sm shadow-blue-200"
              >
                Avanti
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="cursor-pointer rounded-xl bg-[var(--cta)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--cta-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--cta)]/20 shadow-sm shadow-orange-200"
              >
                Analizza il mio profilo
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400">
          I tuoi dati restano sul tuo dispositivo. Nessun dato viene salvato.
        </p>
      </div>
    </div>
  );
}

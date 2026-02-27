"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormStep from "@/components/FormStep";
import type {
  Ruolo,
  Stack,
  RegimeFiscale,
  Obiettivo,
  FormData,
} from "@/lib/types";

const TOTAL_STEPS = 7;

const RUOLO_OPTIONS: { value: Ruolo; label: string }[] = [
  { value: "backend", label: "Backend Developer" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "fullstack", label: "Fullstack Developer" },
  { value: "devops", label: "DevOps/SRE/Cloud" },
  { value: "data", label: "Data Engineer/ML" },
  { value: "altro", label: "Altro" },
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

const OBIETTIVO_OPTIONS: { value: Obiettivo; label: string }[] = [
  { value: "aumentare-tariffa", label: "Aumentare la tariffa" },
  { value: "trovare-clienti", label: "Trovare clienti migliori" },
  { value: "uscire-body-rental", label: "Uscire dal body rental" },
  { value: "ottimizzare-netto", label: "Ottimizzare il netto" },
];

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
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
        if (!ruolo) {
          newErrors.ruolo = "Seleziona un ruolo";
        }
        break;
      case 2:
        if (anniEsperienza === "") {
          newErrors.anniEsperienza = "Inserisci gli anni di esperienza";
        } else if (anniEsperienza < 0 || anniEsperienza > 50) {
          newErrors.anniEsperienza = "Il valore deve essere tra 0 e 50";
        }
        break;
      case 3:
        if (tariffaGiornaliera === "") {
          newErrors.tariffaGiornaliera = "Inserisci la tariffa giornaliera";
        } else if (tariffaGiornaliera < 50 || tariffaGiornaliera > 2000) {
          newErrors.tariffaGiornaliera = "Il valore deve essere tra 50 e 2000";
        }
        break;
      case 4:
        if (!regime) {
          newErrors.regime = "Seleziona il regime fiscale";
        }
        break;
      case 5:
        if (giorniFatturatiMese === "") {
          newErrors.giorniFatturatiMese = "Inserisci i giorni fatturati";
        } else if (giorniFatturatiMese < 1 || giorniFatturatiMese > 23) {
          newErrors.giorniFatturatiMese = "Il valore deve essere tra 1 e 23";
        }
        break;
      case 6:
        // ATECO step: no required validation (toggle defaults to false)
        break;
      case 7:
        if (!obiettivo) {
          newErrors.obiettivo = "Seleziona un obiettivo";
        }
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

    if (stack) {
      formData.stack = stack as Stack;
    }

    if (atecoConosciuto && codiceAteco) {
      formData.codiceAteco = codiceAteco;
    }

    const encodedData = encodeURIComponent(JSON.stringify(formData));
    router.push(`/results?data=${encodedData}`);
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const selectClasses = inputClasses + " appearance-none";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const errorClasses = "mt-1.5 text-sm text-red-600 dark:text-red-400";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight text-foreground">
          Freelance Compass
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep} di {TOTAL_STEPS}
        </p>

        {/* Progress bar */}
        <div className="mb-8 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step 1: Ruolo e Stack */}
        {currentStep === 1 && (
          <FormStep title="Ruolo e Stack">
            <div className="space-y-4">
              <div>
                <label htmlFor="ruolo" className={labelClasses}>
                  Ruolo
                </label>
                <select
                  id="ruolo"
                  value={ruolo}
                  onChange={(e) => setRuolo(e.target.value as Ruolo)}
                  className={selectClasses}
                >
                  <option value="">Seleziona il tuo ruolo</option>
                  {RUOLO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.ruolo && <p className={errorClasses}>{errors.ruolo}</p>}
              </div>

              <div>
                <label htmlFor="stack" className={labelClasses}>
                  Stack tecnologico (opzionale)
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
            </div>
          </FormStep>
        )}

        {/* Step 2: Esperienza */}
        {currentStep === 2 && (
          <FormStep title="Esperienza">
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
                  setAnniEsperienza(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className={inputClasses}
                placeholder="es. 6"
              />
              {errors.anniEsperienza && (
                <p className={errorClasses}>{errors.anniEsperienza}</p>
              )}
            </div>
          </FormStep>
        )}

        {/* Step 3: Tariffa */}
        {currentStep === 3 && (
          <FormStep title="Tariffa">
            <div>
              <label htmlFor="tariffaGiornaliera" className={labelClasses}>
                Tariffa giornaliera (EUR/giorno)
              </label>
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
                className={inputClasses}
                placeholder="es. 350"
              />
              {errors.tariffaGiornaliera && (
                <p className={errorClasses}>{errors.tariffaGiornaliera}</p>
              )}
            </div>
          </FormStep>
        )}

        {/* Step 4: Regime Fiscale */}
        {currentStep === 4 && (
          <FormStep title="Regime Fiscale">
            <fieldset className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="forfettario5"
                  type="radio"
                  name="regime"
                  value="forfettario5"
                  checked={regime === "forfettario5"}
                  onChange={(e) =>
                    setRegime(e.target.value as RegimeFiscale)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="forfettario5"
                  className="text-base text-gray-900 dark:text-gray-100"
                >
                  Forfettario 5% (primi 5 anni)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="forfettario15"
                  type="radio"
                  name="regime"
                  value="forfettario15"
                  checked={regime === "forfettario15"}
                  onChange={(e) =>
                    setRegime(e.target.value as RegimeFiscale)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="forfettario15"
                  className="text-base text-gray-900 dark:text-gray-100"
                >
                  Forfettario 15% (dal 6{"\u00B0"} anno)
                </label>
              </div>
              {errors.regime && <p className={errorClasses}>{errors.regime}</p>}
            </fieldset>
          </FormStep>
        )}

        {/* Step 5: Giorni Fatturati */}
        {currentStep === 5 && (
          <FormStep title="Giorni Fatturati">
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
                placeholder="es. 20"
              />
              {errors.giorniFatturatiMese && (
                <p className={errorClasses}>{errors.giorniFatturatiMese}</p>
              )}
            </div>
          </FormStep>
        )}

        {/* Step 6: Codice ATECO */}
        {currentStep === 6 && (
          <FormStep title="Codice ATECO">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="atecoConosciuto"
                  type="checkbox"
                  checked={atecoConosciuto}
                  onChange={(e) => setAtecoConosciuto(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="atecoConosciuto"
                  className="text-base text-gray-900 dark:text-gray-100"
                >
                  Conosco il mio codice ATECO
                </label>
              </div>

              {atecoConosciuto && (
                <div>
                  <label htmlFor="codiceAteco" className={labelClasses}>
                    Codice ATECO
                  </label>
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
          </FormStep>
        )}

        {/* Step 7: Obiettivo */}
        {currentStep === 7 && (
          <FormStep title="Obiettivo">
            <fieldset className="space-y-3">
              {OBIETTIVO_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-3">
                  <input
                    id={opt.value}
                    type="radio"
                    name="obiettivo"
                    value={opt.value}
                    checked={obiettivo === opt.value}
                    onChange={(e) =>
                      setObiettivo(e.target.value as Obiettivo)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={opt.value}
                    className="text-base text-gray-900 dark:text-gray-100"
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
              {errors.obiettivo && (
                <p className={errorClasses}>{errors.obiettivo}</p>
              )}
            </fieldset>
          </FormStep>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Indietro
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Avanti
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="ml-auto rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Analizza
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

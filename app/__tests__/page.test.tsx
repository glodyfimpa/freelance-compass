import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "@/app/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Multi-step form", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders step 1 with title and progress", () => {
    render(<Home />);
    expect(screen.getByText("Freelance Compass")).toBeInTheDocument();
    expect(screen.getByText("Ruolo e Stack")).toBeInTheDocument();
    expect(screen.getByText("Step 1 di 7")).toBeInTheDocument();
  });

  it("step 1 has a Ruolo dropdown with all role options", () => {
    render(<Home />);
    const ruoloSelect = screen.getByLabelText("Ruolo") as HTMLSelectElement;
    expect(ruoloSelect).toBeInTheDocument();
    const options = Array.from(ruoloSelect.options).map((o) => o.text);
    expect(options).toContain("Backend Developer");
    expect(options).toContain("Frontend Developer");
    expect(options).toContain("Fullstack Developer");
    expect(options).toContain("DevOps/SRE/Cloud");
    expect(options).toContain("Data Engineer/ML");
    expect(options).toContain("Altro");
  });

  it("step 1 has optional Stack dropdown", () => {
    render(<Home />);
    expect(screen.getByLabelText("Stack tecnologico (opzionale)")).toBeInTheDocument();
  });

  it("navigates forward when Ruolo selected", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "backend" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Step 2 di 7")).toBeInTheDocument();
    expect(screen.getByText("Esperienza")).toBeInTheDocument();
  });

  it("blocks forward without Ruolo", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Step 1 di 7")).toBeInTheDocument();
  });

  it("navigates backward", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "backend" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByText("Step 1 di 7")).toBeInTheDocument();
  });

  it("hides Indietro on step 1", () => {
    render(<Home />);
    expect(screen.queryByText("Indietro")).not.toBeInTheDocument();
  });

  it("step 2 numeric input for esperienza", () => {
    render(<Home />);
    goToStep(2);
    const input = screen.getByLabelText("Anni di esperienza");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "50");
  });

  it("step 3 numeric input for tariffa", () => {
    render(<Home />);
    goToStep(3);
    const input = screen.getByLabelText("Tariffa giornaliera (EUR/giorno)");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "50");
    expect(input).toHaveAttribute("max", "2000");
  });

  it("step 4 radio buttons for regime", () => {
    render(<Home />);
    goToStep(4);
    expect(screen.getByLabelText("Forfettario 5% (primi 5 anni)")).toBeInTheDocument();
    expect(screen.getByLabelText("Forfettario 15% (dal 6\u00B0 anno)")).toBeInTheDocument();
  });

  it("step 5 numeric input for giorni", () => {
    render(<Home />);
    goToStep(5);
    const input = screen.getByLabelText("Giorni fatturati al mese");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "23");
  });

  it("step 6 ATECO toggle", () => {
    render(<Home />);
    goToStep(6);
    expect(screen.getByLabelText("Conosco il mio codice ATECO")).toBeInTheDocument();
  });

  it("step 6 shows text field when toggle on", () => {
    render(<Home />);
    goToStep(6);
    fireEvent.click(screen.getByLabelText("Conosco il mio codice ATECO"));
    expect(screen.getByLabelText("Codice ATECO")).toBeInTheDocument();
  });

  it("step 6 hides text field when toggle off", () => {
    render(<Home />);
    goToStep(6);
    expect(screen.queryByLabelText("Codice ATECO")).not.toBeInTheDocument();
  });

  it("step 7 radio buttons for obiettivo", () => {
    render(<Home />);
    goToStep(7);
    expect(screen.getByLabelText("Aumentare la tariffa")).toBeInTheDocument();
    expect(screen.getByLabelText("Trovare clienti migliori")).toBeInTheDocument();
    expect(screen.getByLabelText("Uscire dal body rental")).toBeInTheDocument();
    expect(screen.getByLabelText("Ottimizzare il netto")).toBeInTheDocument();
  });

  it("step 7 shows Analizza instead of Avanti", () => {
    render(<Home />);
    goToStep(7);
    expect(screen.queryByText("Avanti")).not.toBeInTheDocument();
    expect(screen.getByText("Analizza")).toBeInTheDocument();
  });

  it("validates experience out of range", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "55" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 0 e 50")).toBeInTheDocument();
  });

  it("validates tariffa below minimum", () => {
    render(<Home />);
    goToStep(3);
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera (EUR/giorno)"), { target: { value: "30" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 50 e 2000")).toBeInTheDocument();
  });

  it("validates giorni out of range", () => {
    render(<Home />);
    goToStep(5);
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "25" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 1 e 23")).toBeInTheDocument();
  });

  it("submits complete FormData to /results via sessionStorage", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "backend" } });
    fireEvent.change(screen.getByLabelText("Stack tecnologico (opzionale)"), { target: { value: "java-spring" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera (EUR/giorno)"), { target: { value: "350" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByLabelText("Forfettario 15% (dal 6\u00B0 anno)"));
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "20" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByLabelText("Ottimizzare il netto"));
    fireEvent.click(screen.getByText("Analizza"));
    expect(mockPush).toHaveBeenCalledWith("/results");
    const stored = sessionStorage.getItem("freelance-compass-data");
    expect(stored).toBeTruthy();
    const data = JSON.parse(stored!);
    expect(data).toEqual({
      ruolo: "backend",
      stack: "java-spring",
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: "forfettario15",
      giorniFatturatiMese: 20,
      atecoConosciuto: false,
      obiettivo: "ottimizzare-netto",
    });
  });

  it("includes codiceAteco when ATECO is known", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "backend" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera (EUR/giorno)"), { target: { value: "250" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByLabelText("Forfettario 5% (primi 5 anni)"));
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "18" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByLabelText("Conosco il mio codice ATECO"));
    fireEvent.change(screen.getByLabelText("Codice ATECO"), { target: { value: "62.01.00" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByLabelText("Aumentare la tariffa"));
    fireEvent.click(screen.getByText("Analizza"));
    const stored = sessionStorage.getItem("freelance-compass-data");
    const data = JSON.parse(stored!);
    expect(data.atecoConosciuto).toBe(true);
    expect(data.codiceAteco).toBe("62.01.00");
  });

  it("preserves data when navigating back and forth", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "fullstack" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByLabelText("Anni di esperienza")).toHaveValue(10);
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByLabelText("Ruolo")).toHaveValue("fullstack");
  });
});

function goToStep(step: number) {
  if (step <= 1) return;
  fireEvent.change(screen.getByLabelText("Ruolo"), { target: { value: "backend" } });
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 2) return;
  fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 3) return;
  fireEvent.change(screen.getByLabelText("Tariffa giornaliera (EUR/giorno)"), { target: { value: "350" } });
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 4) return;
  fireEvent.click(screen.getByLabelText("Forfettario 15% (dal 6\u00B0 anno)"));
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 5) return;
  fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "20" } });
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 6) return;
  fireEvent.click(screen.getByText("Avanti"));
}

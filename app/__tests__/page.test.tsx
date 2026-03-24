import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "@/app/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Multi-step form (3 steps)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // --- Step 1: Chi sei ---

  it("renders step 1 with title and main heading", () => {
    render(<Home />);
    expect(screen.getByText("Freelance Compass")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chi sei" })).toBeInTheDocument();
  });

  it("step 1 shows all role options as clickable cards", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /Backend Developer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Frontend Developer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Fullstack Developer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /DevOps\/SRE\/Cloud/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Data Engineer\/ML/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Altro/i })).toBeInTheDocument();
  });

  it("step 1 has optional Stack dropdown", () => {
    render(<Home />);
    const stackSelect = screen.getByLabelText(/Stack tecnologico/i) as HTMLSelectElement;
    expect(stackSelect).toBeInTheDocument();
    const options = Array.from(stackSelect.options).map((o) => o.text);
    expect(options).toContain("Java/Spring");
  });

  it("step 1 has anni di esperienza input", () => {
    render(<Home />);
    const input = screen.getByLabelText("Anni di esperienza");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "50");
  });

  it("blocks forward without ruolo selected", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Seleziona un ruolo")).toBeInTheDocument();
  });

  it("blocks forward without anni esperienza", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Backend Developer"));
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Inserisci gli anni di esperienza")).toBeInTheDocument();
  });

  it("validates experience out of range", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Backend Developer"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "55" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 0 e 50")).toBeInTheDocument();
  });

  it("navigates to step 2 when step 1 is valid", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: /Backend Developer/i }));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByRole("heading", { name: "I tuoi numeri" })).toBeInTheDocument();
  });

  it("hides Indietro on step 1", () => {
    render(<Home />);
    expect(screen.queryByText("Indietro")).not.toBeInTheDocument();
  });

  // --- Step 2: I tuoi numeri ---

  it("step 2 has tariffa input", () => {
    render(<Home />);
    goToStep(2);
    const input = screen.getByLabelText("Tariffa giornaliera");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "50");
    expect(input).toHaveAttribute("max", "2000");
  });

  it("step 2 has regime fiscale cards", () => {
    render(<Home />);
    goToStep(2);
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("Primi 5 anni")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("step 2 has giorni fatturati input", () => {
    render(<Home />);
    goToStep(2);
    const input = screen.getByLabelText("Giorni fatturati al mese");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "23");
  });

  it("step 2 has ATECO toggle", () => {
    render(<Home />);
    goToStep(2);
    expect(screen.getByLabelText("Conosco il mio codice ATECO")).toBeInTheDocument();
  });

  it("step 2 shows ATECO field when toggle is on", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.click(screen.getByLabelText("Conosco il mio codice ATECO"));
    expect(screen.getByPlaceholderText("es. 62.01.00")).toBeInTheDocument();
  });

  it("step 2 hides ATECO field when toggle is off", () => {
    render(<Home />);
    goToStep(2);
    expect(screen.queryByPlaceholderText("es. 62.01.00")).not.toBeInTheDocument();
  });

  it("validates tariffa below minimum", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "30" } });
    fireEvent.click(screen.getByText("5%"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "18" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 50 e 2000")).toBeInTheDocument();
  });

  it("validates missing regime", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "350" } });
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "18" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Seleziona il regime fiscale")).toBeInTheDocument();
  });

  it("validates giorni out of range", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "350" } });
    fireEvent.click(screen.getByText("15%"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "25" } });
    fireEvent.click(screen.getByText("Avanti"));
    expect(screen.getByText("Il valore deve essere tra 1 e 23")).toBeInTheDocument();
  });

  // --- Step 3: Obiettivo ---

  it("step 3 shows obiettivo options as cards", () => {
    render(<Home />);
    goToStep(3);
    expect(screen.getByText("Aumentare la tariffa")).toBeInTheDocument();
    expect(screen.getByText("Trovare clienti migliori")).toBeInTheDocument();
    expect(screen.getByText("Uscire dal body rental")).toBeInTheDocument();
    expect(screen.getByText("Ottimizzare il netto")).toBeInTheDocument();
  });

  it("step 3 shows submit button instead of Avanti", () => {
    render(<Home />);
    goToStep(3);
    expect(screen.queryByText("Avanti")).not.toBeInTheDocument();
    expect(screen.getByText("Analizza il mio profilo")).toBeInTheDocument();
  });

  it("validates missing obiettivo on submit", () => {
    render(<Home />);
    goToStep(3);
    fireEvent.click(screen.getByText("Analizza il mio profilo"));
    expect(screen.getByText("Seleziona un obiettivo")).toBeInTheDocument();
  });

  // --- Navigation ---

  it("navigates backward from step 2 to step 1", () => {
    render(<Home />);
    goToStep(2);
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByRole("heading", { name: "Chi sei" })).toBeInTheDocument();
  });

  it("navigates backward from step 3 to step 2", () => {
    render(<Home />);
    goToStep(3);
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByRole("heading", { name: "I tuoi numeri" })).toBeInTheDocument();
  });

  it("preserves data when navigating back and forth", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Backend Developer"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("Avanti"));
    fireEvent.click(screen.getByText("Indietro"));
    expect(screen.getByLabelText("Anni di esperienza")).toHaveValue(10);
  });

  // --- Submit ---

  it("submits complete FormData to /results via sessionStorage", () => {
    render(<Home />);
    // Step 1
    fireEvent.click(screen.getByText("Backend Developer"));
    fireEvent.change(screen.getByLabelText(/Stack tecnologico/i), { target: { value: "java-spring" } });
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
    fireEvent.click(screen.getByText("Avanti"));
    // Step 2
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "350" } });
    fireEvent.click(screen.getByText("15%"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "20" } });
    fireEvent.click(screen.getByText("Avanti"));
    // Step 3
    fireEvent.click(screen.getByText("Ottimizzare il netto"));
    fireEvent.click(screen.getByText("Analizza il mio profilo"));

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
    // Step 1
    fireEvent.click(screen.getByText("Backend Developer"));
    fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Avanti"));
    // Step 2
    fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "250" } });
    fireEvent.click(screen.getByText("5%"));
    fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "18" } });
    fireEvent.click(screen.getByLabelText("Conosco il mio codice ATECO"));
    fireEvent.change(screen.getByPlaceholderText("es. 62.01.00"), { target: { value: "62.01.00" } });
    fireEvent.click(screen.getByText("Avanti"));
    // Step 3
    fireEvent.click(screen.getByText("Aumentare la tariffa"));
    fireEvent.click(screen.getByText("Analizza il mio profilo"));

    const stored = sessionStorage.getItem("freelance-compass-data");
    const data = JSON.parse(stored!);
    expect(data.atecoConosciuto).toBe(true);
    expect(data.codiceAteco).toBe("62.01.00");
  });

  it("shows privacy note below form", () => {
    render(<Home />);
    expect(screen.getByText(/Nessun dato viene salvato/i)).toBeInTheDocument();
  });
});

/** Navigate to a specific step by filling required fields */
function goToStep(step: number) {
  if (step <= 1) return;
  // Step 1 -> 2
  fireEvent.click(screen.getByText("Backend Developer"));
  fireEvent.change(screen.getByLabelText("Anni di esperienza"), { target: { value: "6" } });
  fireEvent.click(screen.getByText("Avanti"));
  if (step <= 2) return;
  // Step 2 -> 3
  fireEvent.change(screen.getByLabelText("Tariffa giornaliera"), { target: { value: "350" } });
  fireEvent.click(screen.getByText("15%"));
  fireEvent.change(screen.getByLabelText("Giorni fatturati al mese"), { target: { value: "20" } });
  fireEvent.click(screen.getByText("Avanti"));
}

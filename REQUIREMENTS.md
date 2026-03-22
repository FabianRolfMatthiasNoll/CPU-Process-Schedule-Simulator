# 📦 Produktdefinition: Scheduling Simulator & Trainer

## 1. Produktvision

Eine interaktive Web-Anwendung zur Visualisierung und Übung von CPU-Scheduling-Algorithmen.

Die Anwendung dient:

* der **Lehre im Hörsaal (Live-Demo)**
* der **gemeinsamen Erarbeitung mit Studierenden**
* der **Visualisierung von Scheduling-Entscheidungen**
* der **Überprüfung eigener Lösungen**

Ziel ist es, Scheduling **nicht nur als Ergebnis (Gantt-Chart)** darzustellen, sondern als **Abfolge von Entscheidungen und Zustandsänderungen**.

---

# 🎯 Gesamtanforderungen (Produkt)

## Kernfähigkeiten

Die Anwendung muss:

1. Scheduling-Probleme modellieren können:

   * Prozesse mit Arrival Time
   * mehrere CPU- und I/O-Bursts
   * Zustände: NEW, READY, RUNNING, BLOCKED, FINISHED

2. Scheduling-Algorithmen ausführen:

   * austauschbar und erweiterbar
   * deterministisch

3. Simulationen erzeugen als:

   * **Sequenz von Events (entscheidend)**
   * * daraus ableitbares Gantt-Chart

4. Visualisieren:

   * Zeitachse
   * CPU-Ausführung (Gantt)
   * Ready Queue
   * Blocked Queue (I/O)
   * aktuelle Zustände

5. Interaktion ermöglichen:

   * automatische Simulation
   * Schritt-für-Schritt
   * freier Übungsmodus

6. Auswertung liefern:

   * Waiting Time
   * Turnaround Time
   * Response Time
   * Durchschnittswerte

---

# 🧠 Zentrale Architekturidee (verpflichtend)

Die Simulation darf **NICHT** direkt als fertiger Zeitplan berechnet werden.

Stattdessen:

➡️ **Event-basierte Simulation**

### Beispiel-Events

* PROCESS_ARRIVED
* PROCESS_DISPATCHED
* PROCESS_PREEMPTED
* CPU_BURST_COMPLETED
* IO_BURST_STARTED
* IO_BURST_COMPLETED
* PROCESS_FINISHED
* TIME_ADVANCED

Diese Events sind:

* Grundlage für Animation
* Grundlage für Step-Modus
* Grundlage für Validierung

---

# 🧱 Architektur (verpflichtend)

## 1. Domain Layer (REIN, OHNE UI)

* Scheduling-Engine
* Algorithmen
* Event-Generierung
* Metriken

➡️ KEINE React-Abhängigkeiten

---

## 2. Application Layer

* Simulation steuern
* Step Forward / Back
* Szenario laden
* Vergleichslogik (Übungsmodus)

---

## 3. Presentation Layer (React)

* UI-Komponenten
* Visualisierung (SVG)
* Animation

---

# ⚙️ Tech Stack (verpflichtend)

* React
* TypeScript
* Vite
* Tailwind CSS
* Motion (Animation)
* Zustand (State)
* Vitest (Unit Tests)
* Playwright (E2E)

---

# 📊 Datenmodell (Core)

## ProcessDefinition

```ts
type Burst =
  | { type: "CPU"; duration: number }
  | { type: "IO"; duration: number };

type ProcessDefinition = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
};
```

---

## SimulationConfig

```ts
type SimulationConfig = {
  algorithm: "FCFS" | "SRTF" | "RR";
  quantum?: number;
};
```

---

## SimulationEvent

```ts
type SimulationEvent =
  | { type: "PROCESS_ARRIVED"; processId: string; time: number }
  | { type: "PROCESS_DISPATCHED"; processId: string; time: number }
  | { type: "PROCESS_PREEMPTED"; processId: string; time: number }
  | { type: "CPU_BURST_COMPLETED"; processId: string; time: number }
  | { type: "IO_BURST_STARTED"; processId: string; time: number }
  | { type: "IO_BURST_COMPLETED"; processId: string; time: number }
  | { type: "PROCESS_FINISHED"; processId: string; time: number };
```

---

## SimulationResult

```ts
type SimulationResult = {
  events: SimulationEvent[];
  metrics: MetricsSummary;
};
```

---

# 📌 V1 – Scope Definition (verbindlich)

## Enthaltene Algorithmen

* FCFS
* SRTF (präemptiv)
* Round Robin

➡️ Architektur MUSS erweiterbar sein für weitere Algorithmen

---

## Unterstützte Prozessstruktur

* Arrival Time
* beliebige Sequenz von:

  * CPU-Bursts
  * I/O-Bursts

---

## Simulation

Die Engine muss korrekt behandeln:

* Prozesse kommen zur Arrival Time
* CPU-Bursts verbrauchen Zeit
* nach CPU-Burst:

  * entweder FINISHED
  * oder Wechsel zu IO → BLOCKED
* nach IO:

  * zurück in READY Queue
* Scheduling wird neu entschieden bei:

  * Prozessankunft
  * CPU-Ende
  * IO-Ende
  * Quantum-Ende (RR)
  * Präemption (SRTF)

---

## Visualisierung (V1)

Die UI muss darstellen:

### 1. Gantt-Chart (CPU)

* horizontale Zeitachse
* Blöcke pro Prozess

### 2. Ready Queue

* aktuelle wartende Prozesse

### 3. Blocked Queue (I/O)

* Prozesse in I/O

### 4. Running Process

* aktuell aktiver Prozess

---

## Modi

### A. Auto-Modus

* komplette Simulation abspielen
* Geschwindigkeit steuerbar

---

### B. Step-Modus

* Schrittweise durch Events gehen
* jeder Scheduling-Entscheidung sichtbar

---

### C. Freier Übungsmodus (V1 – simpel)

#### Verhalten:

* Referenzlösung wird intern berechnet
* Benutzer trifft Entscheidungen:

  * welcher Prozess als nächstes läuft

#### System:

* vergleicht Schritt für Schritt
* merkt erste Abweichung

#### Ausgabe:

* "korrekt bis Schritt X"
* "erste Abweichung bei Schritt Y"
* Möglichkeit:

  * Referenzlösung anzeigen

---

## Metriken (V1)

Für jeden Prozess:

* Waiting Time
* Turnaround Time
* Response Time

Zusätzlich:

* Durchschnittswerte

---

## Eingabe

* Prozesse manuell definierbar
* mehrere Bursts möglich
* Validierung:

  * keine negativen Zeiten
  * mindestens 1 CPU-Burst

---

## Beispiel-Szenarien (fix enthalten)

Mindestens:

* 1x FCFS Beispiel
* 1x SRTF mit Präemption
* 1x Round Robin mit Quantum

---

# 🚫 Nicht Teil von V1

* Prioritätenscheduling
* Multilevel Queues
* Kontextwechselkosten
* Multi-Core
* Export / Sharing
* Benutzerkonten
* Backend

---

# 🧩 Erweiterbarkeit (verpflichtend)

Neue Algorithmen müssen hinzugefügt werden können durch:

```ts
interface SchedulingAlgorithm {
  init(state): void;
  onEvent(state, event): void;
  decideNextProcess(state): string | null;
}
```

---

# 🧪 Tests (verpflichtend)

## Unit Tests (Vitest)

* alle Algorithmen deterministisch testen
* definierte Szenarien → erwartete Eventfolge

## E2E Tests (Playwright)

* UI lädt korrekt
* Simulation läuft durch
* Übungsmodus erkennt Fehler

---

# 🎨 Visualisierung (technische Vorgabe)

* SVG-basierte Darstellung (kein Canvas für V1)
* Animation über Motion
* State-getrieben (React)

---

# ✅ Akzeptanzkriterien V1

Die Anwendung ist fertig, wenn:

1. Benutzer 3–6 Prozesse mit CPU + I/O definieren kann
2. FCFS, SRTF und RR korrekt laufen
3. Gantt-Chart korrekt angezeigt wird
4. Ready + Blocked Queue sichtbar sind
5. Step-by-Step korrekt funktioniert
6. freier Modus:

   * Eingaben möglich
   * erste Abweichung erkannt wird
7. Metriken korrekt berechnet werden
8. Simulation deterministisch ist
9. neue Algorithmen strukturell leicht ergänzt werden können

---

# 🧭 Hinweise zur Implementierung

* Zeitmodell: diskrete Zeiteinheiten (integer)
* Simulation als zentrale Schleife:

  * Events erzeugen
  * State aktualisieren
  * nächste Entscheidung treffen
* KEINE Logik in UI
* KEINE Seiteneffekte in Domain Layer

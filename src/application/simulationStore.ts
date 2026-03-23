import { create } from 'zustand';
import {
  ProcessDefinition,
  SimulationConfig,
  SimulationResult,
  StateSnapshot,
  GanttEntry,
  ProcessSnapshot,
} from '../domain/types';
import { SimulationEngine } from '../domain/engine';

export type SimulationMode = "auto" | "step" | "practice";

interface SimulationStore {
  // Configuration
  processes: ProcessDefinition[];
  config: SimulationConfig;

  // Simulation state
  mode: SimulationMode;
  engine: SimulationEngine | null;

  // Snapshot-based state
  snapshots: StateSnapshot[];
  currentSnapshotIndex: number;

  // Derived state (from current snapshot)
  currentTime: number;
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  ganttEntries: GanttEntry[];
  metrics: SimulationResult['metrics'] | null;

  // UI state
  isRunning: boolean;
  speed: number;

  // Process definitions (for display)
  processDefinitions: ProcessDefinition[];

  // Actions
  setProcesses: (processes: ProcessDefinition[]) => void;
  setConfig: (config: SimulationConfig) => void;
  setMode: (mode: SimulationMode) => void;
  setSpeed: (speed: number) => void;

  initializeSimulation: () => void;
  step: () => void;
  run: () => void;
  pause: () => void;
  reset: () => void;
}

let autoRunInterval: ReturnType<typeof setInterval> | null = null;

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Configuration
  processes: [],
  config: { algorithm: "RR", quantum: 3 },
  mode: "step",

  // Simulation state
  engine: null,

  // Snapshot-based state
  snapshots: [],
  currentSnapshotIndex: -1,

  // Derived state
  currentTime: 0,
  readyQueue: [],
  blockedQueue: [],
  runningProcessId: null,
  ganttEntries: [],
  metrics: null,

  // UI state
  isRunning: false,
  speed: 500,

  // Process definitions
  processDefinitions: [],

  setProcesses: (processes) => set({ processes }),

  setConfig: (config) => set({ config }),

  setMode: (mode) => set({ mode }),

  setSpeed: (speed) => set({ speed }),

  initializeSimulation: () => {
    const { processes, config } = get();
    if (processes.length === 0) return;

    // Create engine and run to completion to generate all snapshots
    const engine = new SimulationEngine(processes, config);

    const snapshots: StateSnapshot[] = [];
    while (!engine.isFinished()) {
      const snapshot = engine.tick();
      snapshots.push(snapshot);
    }

    // Add final snapshot
    snapshots.push(engine.getCurrentSnapshot());

    // Get final metrics without re-running (engine is already at finished state)
    const finalSnapshot = engine.getCurrentSnapshot();
    const processList = Array.from(finalSnapshot.processes.values());

    const metrics: SimulationResult['metrics'] = {
      processes: processList.map(p => ({
        id: p.id,
        waitingTime: p.waitingTime,
        turnaroundTime: p.turnaroundTime,
        responseTime: p.responseTime ?? 0,
      })),
      averages: {
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: 0,
      },
    };

    const count = metrics.processes.length;
    if (count > 0) {
      metrics.averages.waitingTime = metrics.processes.reduce((sum, p) => sum + p.waitingTime, 0) / count;
      metrics.averages.turnaroundTime = metrics.processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / count;
      metrics.averages.responseTime = metrics.processes.reduce((sum, p) => sum + p.responseTime, 0) / count;
    }

    set({
      engine,
      snapshots,
      currentSnapshotIndex: -1,
      currentTime: 0,
      readyQueue: [],
      blockedQueue: [],
      runningProcessId: null,
      ganttEntries: [],
      metrics,
      processDefinitions: processes,
      isRunning: false,
    });
  },

  step: () => {
    const { snapshots, currentSnapshotIndex, engine } = get();

    if (!engine) return;
    if (currentSnapshotIndex >= snapshots.length - 1) return;

    const nextIndex = currentSnapshotIndex + 1;
    const snapshot = snapshots[nextIndex];

    set({
      currentSnapshotIndex: nextIndex,
      currentTime: snapshot.time,
      readyQueue: snapshot.readyQueue,
      blockedQueue: snapshot.blockedQueue,
      runningProcessId: snapshot.runningProcessId,
      ganttEntries: snapshot.ganttEntries,
    });
  },

  run: () => {
    const { isRunning, speed } = get();
    if (isRunning) return;

    set({ isRunning: true });

    autoRunInterval = setInterval(() => {
      const { currentSnapshotIndex, snapshots, engine } = get();

      if (!engine) {
        get().pause();
        return;
      }

      // Check if we can step
      if (currentSnapshotIndex >= snapshots.length - 1) {
        get().pause();
        return;
      }

      get().step();
    }, speed);
  },

  pause: () => {
    if (autoRunInterval) {
      clearInterval(autoRunInterval);
      autoRunInterval = null;
    }
    set({ isRunning: false });
  },

  reset: () => {
    get().pause();
    set({
      snapshots: [],
      currentSnapshotIndex: -1,
      currentTime: 0,
      readyQueue: [],
      blockedQueue: [],
      runningProcessId: null,
      ganttEntries: [],
      metrics: null,
      engine: null,
    });
  },
}));

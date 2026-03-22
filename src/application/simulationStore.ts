import { create } from 'zustand';
import {
  ProcessDefinition,
  SimulationConfig,
  SimulationEvent,
  SimulationState,
  SimulationResult,
  MetricsSummary,
  GanttEntry,
  Process,
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
  currentEventIndex: number;
  events: SimulationEvent[];
  currentTime: number;
  isRunning: boolean;
  speed: number;

  // Computed from engine state
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  runningSince: number | null;
  finishedProcesses: string[];
  ganttEntries: GanttEntry[];
  ioBlocks: { processId: string; startTime: number; endTime: number }[];
  currentIoProcess: { processId: string; startTime: number } | null;
  rescheduleTimes: number[];
  metrics: MetricsSummary | null;

  // Practice mode
  userDecisions: string[];
  expectedDecisions: string[];
  practiceError: string | null;
  practiceCorrectUpTo: number;

  // Process state visualization
  processStates: Map<string, Process>;

  // Actions
  setProcesses: (processes: ProcessDefinition[]) => void;
  setConfig: (config: SimulationConfig) => void;
  setMode: (mode: SimulationMode) => void;
  setSpeed: (speed: number) => void;

  initializeSimulation: () => void;
  step: () => SimulationEvent[];
  run: () => void;
  pause: () => void;
  reset: () => void;
  goToTime: (time: number) => void;
  submitUserDecision: (processId: string) => boolean;
  showReferenceSolution: () => void;
  getReadyQueue: () => string[];
  getBlockedQueue: () => string[];
  getRunningProcess: () => string | null;
  getFinishedProcesses: () => string[];
}

let autoRunInterval: ReturnType<typeof setInterval> | null = null;

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  processes: [],
  config: { algorithm: "FCFS", quantum: 4 },
  mode: "step",
  engine: null,
  currentEventIndex: -1,
  events: [] as SimulationEvent[],
  currentTime: 0,
  isRunning: false,
  speed: 1,
  readyQueue: [],
  blockedQueue: [] as string[],
  runningProcessId: null,
  runningSince: null as number | null,
  finishedProcesses: [],
  ganttEntries: [] as GanttEntry[],
  ioBlocks: [] as { processId: string; startTime: number; endTime: number }[],
  currentIoProcess: null as { processId: string; startTime: number } | null,
  rescheduleTimes: [] as number[],
  metrics: null as MetricsSummary | null,
  userDecisions: [],
  expectedDecisions: [],
  practiceError: null,
  practiceCorrectUpTo: -1,
  processStates: new Map(),

  setProcesses: (processes) => set({ processes }),

  setConfig: (config) => set({ config }),

  setMode: (mode) => {
    set({ mode });
    if (mode !== "auto") {
      const { pause } = get();
      pause();
    }
  },

  setSpeed: (speed) => set({ speed }),

  initializeSimulation: () => {
    const { processes, config } = get();
    if (processes.length === 0) return;

    const engine = new SimulationEngine(processes, config);

    // Run to completion for reference (to get expected decisions and metrics)
    const result = engine.runToCompletion();

    // Extract expected scheduling decisions from events (practice mode)
    const expectedDecisions: string[] = [];
    for (const event of result.events) {
      if (event.type === "PROCESS_DISPATCHED") {
        expectedDecisions.push(event.processId);
      }
    }

    // Reset engine to initial state
    const engine2 = new SimulationEngine(processes, config);

    set({
      engine: engine2,
      events: [],
      currentEventIndex: -1,
      currentTime: 0,
      expectedDecisions,
      metrics: result.metrics,
      ganttEntries: [],
      userDecisions: [],
      practiceError: null,
      practiceCorrectUpTo: -1,
      readyQueue: [],
      blockedQueue: [],
      runningProcessId: null,
      finishedProcesses: [],
      processStates: new Map(),
    });

    console.log('[Store] Initialized simulation with', result.events.length, 'reference events');
  },

  step: () => {
    const { engine, currentEventIndex, events, rescheduleTimes } = get();
    if (!engine) return [];

    if (engine.isFinished()) {
      console.log('[STEP] simulation finished');
      return [];
    }

    const newEvents = engine.tick();
    const state = engine.getState();

    console.log('[STEP] t=', state.time, 'events:', newEvents.map(e => e.type).join(', '));

    // Track IO blocks from events
    // IO starts at the NEXT tick after IO_BURST_STARTED (event.time + 1)
    // because the current tick is consumed by the CPU burst completion
    const currentIo = get().currentIoProcess;
    const ioBlocks = [...get().ioBlocks];
    let newCurrentIoProcess = currentIo;

    // Track reschedule times from PREEMPTED events
    const newRescheduleTimes = [...rescheduleTimes];

    for (const event of newEvents) {
      if (event.type === 'IO_BURST_STARTED') {
        // IO starts at NEXT tick after CPU burst completes
        newCurrentIoProcess = { processId: (event as any).processId, startTime: (event as any).time + 1 };
      } else if (event.type === 'IO_BURST_COMPLETED' && currentIo) {
        // IO ends at NEXT tick (the current tick is consumed by IO)
        ioBlocks.push({
          processId: currentIo.processId,
          startTime: currentIo.startTime,
          endTime: (event as any).time + 1,
        });
        newCurrentIoProcess = null;
      }
    }

    // Update state from engine
    set({
      currentTime: state.time,
      currentEventIndex: currentEventIndex + newEvents.length,
      events: [...events, ...newEvents],
      readyQueue: [...state.readyQueue],
      blockedQueue: [...state.blockedQueue],
      runningProcessId: state.runningProcessId,
      runningSince: state.currentGanttStart,
      finishedProcesses: Array.from(state.processes.values())
        .filter(p => p.state === "FINISHED")
        .map(p => p.id),
      ganttEntries: [...state.ganttEntries],
      ioBlocks,
      currentIoProcess: newCurrentIoProcess,
      rescheduleTimes: newRescheduleTimes,
    });

    return newEvents;
  },

  run: () => {
    const { isRunning, speed } = get();
    if (isRunning) return;

    set({ isRunning: true });

    autoRunInterval = setInterval(() => {
      const { engine } = get();
      if (!engine || engine.isFinished()) {
        get().pause();
        return;
      }
      get().step();
    }, 1000 / speed);
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
    const { processes, config } = get();
    if (processes.length === 0) return;

    const engine = new SimulationEngine(processes, config);

    set({
      engine,
      currentTime: 0,
      readyQueue: [],
      blockedQueue: [],
      runningProcessId: null,
      finishedProcesses: [],
      ganttEntries: [],
      ioBlocks: [],
      currentIoProcess: null,
      rescheduleTimes: [],
      userDecisions: [],
      practiceError: null,
      practiceCorrectUpTo: -1,
    });
  },

  goToTime: (time) => {
    const { engine, currentTime } = get();
    if (!engine) return;

    // Step until we reach the desired time
    while (engine.getCurrentTime() < time && !engine.isFinished()) {
      engine.tick();
    }

    const state = engine.getState();
    set({
      currentTime: state.time,
      readyQueue: [...state.readyQueue],
      blockedQueue: [...state.blockedQueue],
      runningProcessId: state.runningProcessId,
      finishedProcesses: Array.from(state.processes.values())
        .filter(p => p.state === "FINISHED")
        .map(p => p.id),
    });
  },

  submitUserDecision: (processId) => {
    const { expectedDecisions, userDecisions, practiceCorrectUpTo } = get();

    userDecisions.push(processId);
    const decisionIndex = userDecisions.length - 1;

    if (expectedDecisions[decisionIndex] === processId) {
      set({ userDecisions, practiceCorrectUpTo: decisionIndex, practiceError: null });
      return true;
    } else {
      set({
        userDecisions,
        practiceCorrectUpTo: decisionIndex - 1,
        practiceError: `Fehler bei Schritt ${decisionIndex + 1}: Prozess "${processId}" war nicht die richtige Wahl.`,
      });
      return false;
    }
  },

  showReferenceSolution: () => {
    const { expectedDecisions } = get();
    set({ userDecisions: [...expectedDecisions] });
  },

  getReadyQueue: () => get().readyQueue,

  getBlockedQueue: () => get().blockedQueue,

  getRunningProcess: () => get().runningProcessId,

  getFinishedProcesses: () => get().finishedProcesses,
}));

// Domain types for CPU Scheduling Simulator
// NO React dependencies - pure TypeScript

export type Burst =
  | { type: "CPU"; duration: number }
  | { type: "IO"; duration: number };

export type ProcessDefinition = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
};

export type ProcessState = "NEW" | "READY" | "RUNNING" | "BLOCKED" | "FINISHED";

// Runtime process state (mutable during simulation)
export type Process = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
  currentBurstIndex: number;
  remainingBurstTime: number;  // Remaining time in current CPU burst
  ioRemainingTime: number;    // Remaining time in current IO burst
  state: ProcessState;
  totalCpuTime: number;
  totalIoTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number | null;
  firstCpuTime: number | null;
  quantumUsed: number;         // Ticks used in current RR quantum slice
};

// Complete snapshot of simulation state at a point in time (immutable)
export type StateSnapshot = {
  time: number;
  processes: Map<string, ProcessSnapshot>;
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  ganttEntries: GanttEntry[];
  currentGanttStart: number | null;  // Start time of current CPU execution
  runningDispatchEnd: number | null; // End time of current dispatch (when quantum/burst expires)
  ioSnapshotStarts: Map<string, number>; // processId -> start time of current IO burst
};

// Immutable snapshot of a single process (for storing in StateSnapshot)
export type ProcessSnapshot = {
  id: string;
  state: ProcessState;
  currentBurstIndex: number;
  remainingBurstTime: number;
  ioRemainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number | null;
  firstCpuTime: number | null;
};

export type SimulationConfig = {
  algorithm: "FCFS" | "SRTF" | "RR";
  quantum?: number;
};

export type SimulationEvent =
  | { type: "PROCESS_ARRIVED"; processId: string; time: number }
  | { type: "PROCESS_DISPATCHED"; processId: string; time: number }
  | { type: "PROCESS_PREEMPTED"; processId: string; time: number }
  | { type: "CPU_BURST_COMPLETED"; processId: string; time: number }
  | { type: "IO_BURST_STARTED"; processId: string; time: number }
  | { type: "IO_BURST_COMPLETED"; processId: string; time: number }
  | { type: "PROCESS_FINISHED"; processId: string; time: number }
  | { type: "TIME_ADVANCED"; time: number };

export type MetricsSummary = {
  processes: {
    id: string;
    waitingTime: number;
    turnaroundTime: number;
    responseTime: number;
  }[];
  averages: {
    waitingTime: number;
    turnaroundTime: number;
    responseTime: number;
  };
};

export type SimulationResult = {
  events: SimulationEvent[];
  metrics: MetricsSummary;
  ganttEntries: GanttEntry[];
};

export type GanttEntry = {
  processId: string;
  startTime: number;
  endTime: number;
  type: "CPU" | "IO";
};

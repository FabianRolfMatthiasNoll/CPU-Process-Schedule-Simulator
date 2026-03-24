// Domain types for CPU Scheduling Simulator
// NO React dependencies - pure TypeScript

export type Burst =
  | { type: "CPU"; duration: number }
  | { type: "IO"; duration: number };

export type ProcessDefinition = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
  priority?: number;  // Lower number = higher priority (for Priority scheduling)
};

export type ProcessState = "NEW" | "READY" | "RUNNING" | "BLOCKED" | "FINISHED";

// Runtime process state (mutable during simulation)
export type Process = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
  currentBurstIndex: number;
  remainingBurstTime: number;  // Remaining time in current burst (CPU or IO)
  burstStartTime: number;     // When current burst started (for rendering)
  state: ProcessState;
  totalCpuTime: number;
  totalIoTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number | null;
  firstCpuTime: number | null;
  quantumUsed: number;         // Ticks used in current RR quantum slice
  priority?: number;           // Lower = higher priority (for Priority scheduling)
};

// Complete snapshot of simulation state at a point in time (immutable)
export type StateSnapshot = {
  time: number;
  processes: Map<string, ProcessSnapshot>;
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  ganttEntries: GanttEntry[];
  currentTickArrivals: string[];  // Process IDs that arrived at the current time
  schedulingDecision?: SchedulingDecision;  // Why the scheduler made its decision
};

// Explanation of scheduling decision for UI
export type SchedulingDecision = {
  reason: string;               // Human-readable explanation in German
  selectedProcessId: string | null;
  alternatives?: string[];      // What other options existed
};

// Immutable snapshot of a single process (for storing in StateSnapshot)
export type ProcessSnapshot = {
  id: string;
  state: ProcessState;
  currentBurstIndex: number;
  remainingBurstTime: number;
  burstStartTime: number;  // When current burst started
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number | null;
  firstCpuTime: number | null;
};

export type SimulationConfig = {
  algorithm: "FCFS" | "SJF" | "SRTF" | "RR" | "Priority";
  quantum?: number;
  preemptive?: boolean;  // For Priority scheduling
};

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
  metrics: MetricsSummary;
  ganttEntries: GanttEntry[];
};

export type GanttEntry = {
  processId: string;
  startTime: number;
  endTime: number;
  type: "CPU" | "IO";
};

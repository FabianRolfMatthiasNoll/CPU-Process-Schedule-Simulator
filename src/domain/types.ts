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

export type Process = {
  id: string;
  arrivalTime: number;
  bursts: Burst[];
  currentBurstIndex: number;
  remainingBurstTime: number;  // For current CPU burst
  ioRemainingTime: number;    // For current IO burst (when blocked)
  state: ProcessState;
  totalCpuTime: number;
  totalIoTime: number;
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
};

export type SimulationState = {
  time: number;
  processes: Map<string, Process>;
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  cpuRemainingTime: number;
  events: SimulationEvent[];
  ganttEntries: GanttEntry[];
  currentGanttStart: number | null;
  finished: boolean;
};

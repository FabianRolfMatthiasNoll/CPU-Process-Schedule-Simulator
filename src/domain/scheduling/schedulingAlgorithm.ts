export interface ProcessInfo {
  id: string;
  remainingCpuTime: number;  // Total remaining CPU time (current + future bursts)
}

export interface SchedulingState {
  time: number;
  readyQueue: string[];
  blockedQueue: string[];
  runningProcessId: string | null;
  processInfos: Map<string, ProcessInfo>;  // All processes for SRTF comparison
}

export interface SchedulingAlgorithm {
  name: string;
  decideNextProcess(state: SchedulingState): string | null;
}

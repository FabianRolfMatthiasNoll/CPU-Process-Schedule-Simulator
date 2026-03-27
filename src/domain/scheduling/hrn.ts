import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class HRRNAlgorithm implements SchedulingAlgorithm {
  name = "HRRN";

  decideNextProcess(state: SchedulingState): string | null {
    // HRRN is non-preemptive: if something is running, keep it
    if (state.runningProcessId !== null) {
      return state.runningProcessId;
    }

    if (state.readyQueue.length === 0) {
      return null;
    }

    // Pick the process with highest response ratio
    // Response Ratio = (waitingTime + burstTime) / burstTime = 1 + waitingTime/burstTime
    let highestRRId: string | null = null;
    let highestRR = -Infinity;

    for (const pid of state.readyQueue) {
      const info = state.processInfos.get(pid);
      if (info) {
        // Use remaining CPU time as the "burst time" for calculation
        const burstTime = info.remainingCpuTime;
        const waitingTime = info.waitingTime ?? 0;
        // Avoid division by zero
        if (burstTime > 0) {
          const responseRatio = (waitingTime + burstTime) / burstTime;
          if (responseRatio > highestRR) {
            highestRR = responseRatio;
            highestRRId = pid;
          }
        }
      }
    }

    return highestRRId;
  }
}
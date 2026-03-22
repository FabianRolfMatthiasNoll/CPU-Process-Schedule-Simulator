import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class SRTFAlgorithm implements SchedulingAlgorithm {
  name = "SRTF";

  decideNextProcess(state: SchedulingState): string | null {
    if (state.readyQueue.length === 0) {
      return null;
    }

    // Find shortest remaining time in ready queue
    let shortestProcessId: string | null = null;
    let shortestTime = Infinity;

    for (const pid of state.readyQueue) {
      const info = state.processInfos.get(pid);
      if (info && info.remainingCpuTime < shortestTime) {
        shortestTime = info.remainingCpuTime;
        shortestProcessId = pid;
      }
    }

    if (shortestProcessId === null) {
      return null;
    }

    // SRTF: If running process has remaining time > shortest ready, preempt
    if (state.runningProcessId !== null && state.runningProcessId !== shortestProcessId) {
      const runningInfo = state.processInfos.get(state.runningProcessId);
      if (runningInfo && runningInfo.remainingCpuTime > shortestTime) {
        // Preempt current process
        return shortestProcessId;
      }
    }

    // If no running process or current is shortest, run shortest
    return shortestProcessId;
  }
}

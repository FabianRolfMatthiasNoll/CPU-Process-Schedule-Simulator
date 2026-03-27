import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class LRTFAlgorithm implements SchedulingAlgorithm {
  name = "LRTF";

  decideNextProcess(state: SchedulingState): string | null {
    // LRTF is preemptive: always pick longest remaining time
    if (state.readyQueue.length === 0 && state.runningProcessId === null) {
      return null;
    }

    let longestId: string | null = null;
    let longestTime = -Infinity;

    // Check running process
    if (state.runningProcessId !== null) {
      const runningInfo = state.processInfos.get(state.runningProcessId);
      if (runningInfo) {
        longestTime = runningInfo.remainingCpuTime;
        longestId = state.runningProcessId;
      }
    }

    // Check ready queue for longer remaining time
    for (const pid of state.readyQueue) {
      const info = state.processInfos.get(pid);
      if (info && info.remainingCpuTime > longestTime) {
        longestTime = info.remainingCpuTime;
        longestId = pid;
      }
    }

    return longestId;
  }
}
import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class LJFAlgorithm implements SchedulingAlgorithm {
  name = "LJF";

  decideNextProcess(state: SchedulingState): string | null {
    // LJF is non-preemptive: if something is running, keep it
    if (state.runningProcessId !== null) {
      return state.runningProcessId;
    }

    if (state.readyQueue.length === 0) {
      return null;
    }

    // Pick the longest job from the ready queue
    let longestId: string | null = null;
    let longestTime = -Infinity;

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
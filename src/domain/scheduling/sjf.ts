import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class SJFAlgorithm implements SchedulingAlgorithm {
  name = "SJF";

  decideNextProcess(state: SchedulingState): string | null {
    // SJF is non-preemptive: if something is running, keep it
    if (state.runningProcessId !== null) {
      return state.runningProcessId;
    }

    if (state.readyQueue.length === 0) {
      return null;
    }

    // Pick the shortest job from the ready queue
    let shortestId: string | null = null;
    let shortestTime = Infinity;

    for (const pid of state.readyQueue) {
      const info = state.processInfos.get(pid);
      if (info && info.remainingCpuTime < shortestTime) {
        shortestTime = info.remainingCpuTime;
        shortestId = pid;
      }
    }

    return shortestId;
  }
}
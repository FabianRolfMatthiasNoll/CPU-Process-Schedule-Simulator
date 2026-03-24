import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class SRTFAlgorithm implements SchedulingAlgorithm {
  name = "SRTF";

  decideNextProcess(state: SchedulingState): string | null {
    // If no running process and no ready processes, nothing to do
    if (state.runningProcessId === null && state.readyQueue.length === 0) {
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

    // If there's a running process, check if we should preempt
    if (state.runningProcessId !== null) {
      const runningInfo = state.processInfos.get(state.runningProcessId);
      if (runningInfo) {
        // If no ready process or running is shorter/equal, keep running
        if (shortestProcessId === null || runningInfo.remainingCpuTime <= shortestTime) {
          return state.runningProcessId;
        }
        // Running is longer than shortest, preempt
        if (shortestProcessId !== null && runningInfo.remainingCpuTime > shortestTime) {
          return shortestProcessId;
        }
      }
    }

    // No running process - run shortest from ready queue
    if (shortestProcessId === null) {
      return null;
    }
    return shortestProcessId;
  }
}

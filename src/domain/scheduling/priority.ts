import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class PriorityAlgorithm implements SchedulingAlgorithm {
  name = "Priority";
  private preemptive: boolean;

  constructor(preemptive: boolean = true) {
    this.preemptive = preemptive;
  }

  decideNextProcess(state: SchedulingState): string | null {
    // Find the highest priority (lowest number) process in ready queue
    let highestPriId: string | null = null;
    let highestPriority = Infinity; // Lower number = higher priority

    for (const pid of state.readyQueue) {
      const info = state.processInfos.get(pid);
      if (info && info.priority !== undefined && info.priority < highestPriority) {
        highestPriority = info.priority;
        highestPriId = pid;
      }
    }

    // If no process in ready queue has priority, don't switch
    if (highestPriId === null) {
      return state.runningProcessId;
    }

    if (state.runningProcessId !== null) {
      const runningInfo = state.processInfos.get(state.runningProcessId);
      const runningPriority = runningInfo?.priority ?? Infinity;

      if (this.preemptive && highestPriority < runningPriority) {
        // Preempt: higher priority process arrived
        return highestPriId;
      }
      // Non-preemptive or lower priority: keep running
      return state.runningProcessId;
    }

    return highestPriId;
  }
}
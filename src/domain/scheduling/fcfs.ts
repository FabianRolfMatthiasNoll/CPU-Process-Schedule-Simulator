import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class FCFSAlgorithm implements SchedulingAlgorithm {
  name = "FCFS";

  decideNextProcess(state: SchedulingState): string | null {
    // FCFS doesn't preempt - if there's a running process, keep it
    if (state.runningProcessId !== null) {
      return state.runningProcessId;
    }

    if (state.readyQueue.length === 0) {
      return null;
    }
    // FCFS: First-Come-First-Serve - pick first in queue (added in arrival order)
    return state.readyQueue[0];
  }
}

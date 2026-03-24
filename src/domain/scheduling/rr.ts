import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class RRAlgorithm implements SchedulingAlgorithm {
  name = "RR";
  private quantum: number;

  constructor(quantum: number) {
    this.quantum = quantum;
  }

  decideNextProcess(state: SchedulingState): string | null {
    // RR doesn't preempt based on new arrivals - quantum preemption is handled in executeRunningProcess
    if (state.runningProcessId !== null) {
      return state.runningProcessId;
    }

    if (state.readyQueue.length === 0) {
      return null;
    }
    // RR: Simple round-robin - pick from front of queue
    return state.readyQueue[0];
  }

  getQuantum(): number {
    return this.quantum;
  }
}

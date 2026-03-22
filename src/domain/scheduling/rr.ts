import { SchedulingAlgorithm, SchedulingState } from './schedulingAlgorithm';

export class RRAlgorithm implements SchedulingAlgorithm {
  name = "RR";
  private quantum: number;

  constructor(quantum: number) {
    this.quantum = quantum;
  }

  decideNextProcess(state: SchedulingState): string | null {
    // RR: Simple round-robin - pick from front of queue
    // Preemption is handled by engine based on quantumUsed
    if (state.readyQueue.length === 0) {
      return null;
    }
    return state.readyQueue[0];
  }

  getQuantum(): number {
    return this.quantum;
  }
}

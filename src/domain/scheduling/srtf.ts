import { SchedulingAlgorithm } from './schedulingAlgorithm';
import { Process, SimulationState } from '../types';

export class SRTFAlgorithm implements SchedulingAlgorithm {
  name = "SRTF";

  init(_state: SimulationState): void {
    // No initialization needed
  }

  onEvent(_state: SimulationState, _event: { type: string; processId?: string; time?: number }): void {
    // SRTF relies on decideNextProcess being called at scheduling points
  }

  decideNextProcess(state: SimulationState): string | null {
    if (state.readyQueue.length === 0) {
      return null;
    }
    // SRTF: Shortest Remaining Time First - pick process with least remaining CPU time
    const processes = Array.from(state.readyQueue)
      .map(id => state.processes.get(id))
      .filter((p): p is Process => p !== undefined);

    if (processes.length === 0) return null;

    const shortest = processes.reduce((min, p) => {
      const minRemaining = this.getRemainingCpuTime(min, state);
      const pRemaining = this.getRemainingCpuTime(p, state);
      return pRemaining < minRemaining ? p : min;
    });

    return shortest.id;
  }

  private getRemainingCpuTime(process: Process, state: SimulationState): number {
    let total = process.remainingBurstTime;
    for (let i = process.currentBurstIndex + 1; i < process.bursts.length; i++) {
      const burst = process.bursts[i];
      if (burst.type === "CPU") {
        total += burst.duration;
      }
    }
    return total;
  }

  onTimeAdvance(_state: SimulationState, _delta: number): void {
    // SRTF relies on decideNextProcess
  }
}

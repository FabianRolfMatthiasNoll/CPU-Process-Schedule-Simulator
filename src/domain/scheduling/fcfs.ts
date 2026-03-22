import { SchedulingAlgorithm } from './schedulingAlgorithm';
import { Process, SimulationState } from '../types';

export class FCFSAlgorithm implements SchedulingAlgorithm {
  name = "FCFS";

  init(_state: SimulationState): void {
    // No initialization needed for FCFS
  }

  onEvent(_state: SimulationState, _event: { type: string; processId?: string; time?: number }): void {
    // FCFS doesn't need special event handling
  }

  decideNextProcess(state: SimulationState): string | null {
    if (state.readyQueue.length === 0) {
      return null;
    }
    // FCFS: First-Come-First-Serve - pick the process that arrived earliest
    const processes = Array.from(state.readyQueue)
      .map(id => state.processes.get(id))
      .filter((p): p is Process => p !== undefined);

    if (processes.length === 0) return null;

    const earliest = processes.reduce((min, p) =>
      p.arrivalTime < min.arrivalTime ? p : min
    );

    return earliest.id;
  }

  onTimeAdvance(_state: SimulationState, _delta: number): void {
    // FCFS doesn't need special time handling
  }
}

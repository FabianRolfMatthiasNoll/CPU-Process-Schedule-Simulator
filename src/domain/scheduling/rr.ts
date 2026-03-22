import { SchedulingAlgorithm } from './schedulingAlgorithm';
import { Process, SimulationState } from '../types';

export class RRAlgorithm implements SchedulingAlgorithm {
  name = "RR";
  private quantum: number = 4;

  init(state: SimulationState): void {
    // Quantum should be set from config before init is called
  }

  setQuantum(quantum: number): void {
    this.quantum = quantum;
  }

  onEvent(state: SimulationState, event: { type: string; processId?: string; time?: number }): void {
    // When quantum expires (handled in simulation engine), we need to preempt
    if (event.type === "QUANTUM_EXPIRED" && state.runningProcessId) {
      // Process will be preempted in the simulation engine
    }
  }

  decideNextProcess(state: SimulationState): string | null {
    if (state.readyQueue.length === 0) {
      return null;
    }
    // RR: Simple round-robin - just take from front of queue
    return state.readyQueue[0];
  }

  getQuantum(): number {
    return this.quantum;
  }

  onTimeAdvance(state: SimulationState, delta: number): void {
    // Check if quantum expires
    if (state.runningProcessId && state.cpuRemainingTime <= 0) {
      // Quantum expired, handled by simulation engine
    }
  }
}

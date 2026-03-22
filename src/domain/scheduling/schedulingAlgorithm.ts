import { Process, SimulationState } from '../types';

export interface SchedulingAlgorithm {
  name: string;
  init(state: SimulationState): void;
  onEvent(state: SimulationState, event: { type: string; processId?: string; time?: number }): void;
  decideNextProcess(state: SimulationState): string | null;
  onTimeAdvance(state: SimulationState, delta: number): void;
}

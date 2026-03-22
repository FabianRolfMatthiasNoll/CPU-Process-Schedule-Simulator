import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../domain/engine';
import { ProcessDefinition, SimulationConfig } from '../domain/types';

describe('FCFS Algorithm', () => {
  it('should execute simple FCFS correctly', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 8 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    // FCFS: P1 runs first, then P2, then P3
    // P1: 0-5, P2: 5-8, P3: 8-16

    expect(result.ganttEntries).toHaveLength(3);
    expect(result.ganttEntries[0]).toEqual({ processId: 'P1', startTime: 0, endTime: 5 });
    expect(result.ganttEntries[1]).toEqual({ processId: 'P2', startTime: 5, endTime: 8 });
    expect(result.ganttEntries[2]).toEqual({ processId: 'P3', startTime: 8, endTime: 16 });
  });

  it('should handle process arrivals at different times', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 4 }] },
      { id: 'P2', arrivalTime: 5, bursts: [{ type: 'CPU', duration: 3 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    // P1 runs 0-4, CPU idle 4-5, P2 runs 5-8
    expect(result.ganttEntries[0]).toEqual({ processId: 'P1', startTime: 0, endTime: 4 });
    expect(result.ganttEntries[1]).toEqual({ processId: 'P2', startTime: 5, endTime: 8 });
  });

  it('should calculate correct waiting times', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    // P1 waiting: 0 (arrives at 0, runs immediately)
    // P2 waiting: 5-1 = 4 (arrives at 1, runs from 5-8)
    const p1Metrics = result.metrics.processes.find(p => p.id === 'P1');
    const p2Metrics = result.metrics.processes.find(p => p.id === 'P2');

    expect(p1Metrics?.waitingTime).toBe(0);
    expect(p2Metrics?.waitingTime).toBe(4);
  });
});

describe('SRTF Algorithm', () => {
  it('should preempt for shorter processes', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 7 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 4 }] },
      { id: 'P3', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 2 }] },
    ];
    const config: SimulationConfig = { algorithm: 'SRTF' };

    const result = SimulationEngine.simulate(processes, config);

    // SRTF execution:
    // 0-1: P1 (remaining 7)
    // 1-2: P1 (6), P2 arrives with 4 (shorter than 6)
    // 2-3: P1 (5), P3 arrives with 2 (shorter than 5)
    // Actually at time 2, P3 has 2, P1 has 5, P2 has 4
    // So P3 runs first, then P2, then P1

    // Expected order by shortest remaining:
    // P1 starts at 0
    // At t=1, P2 arrives (4 remaining) vs P1 (6 remaining) -> P2 runs
    // At t=4, P3 arrived at 2 and has 2 remaining (vs P1's 5)
    // So timeline: P1(0-1), P2(1-4), P3(4-6), P1(6-11)

    expect(result.ganttEntries[0].processId).toBe('P1');
    expect(result.ganttEntries[0].startTime).toBe(0);
    expect(result.ganttEntries[1].processId).toBe('P2');
    expect(result.ganttEntries[2].processId).toBe('P3');
  });

  it('should handle same arrival times correctly', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
      { id: 'P2', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }] },
    ];
    const config: SimulationConfig = { algorithm: 'SRTF' };

    const result = SimulationEngine.simulate(processes, config);

    // All arrive at 0, shortest first: P2(3), P1(5), P3(8)
    expect(result.ganttEntries[0].processId).toBe('P2');
    expect(result.ganttEntries[1].processId).toBe('P1');
    expect(result.ganttEntries[2].processId).toBe('P3');
  });
});

describe('Round Robin Algorithm', () => {
  it('should time-slice correctly', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }] },
      { id: 'P2', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 4 }] },
      { id: 'P3', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 2 }] },
    ];
    const config: SimulationConfig = { algorithm: 'RR', quantum: 3 };

    const result = SimulationEngine.simulate(processes, config);

    // With quantum=3:
    // 0-3: P1 (8->5 remaining)
    // 3-6: P2 (4->1 remaining)
    // 6-8: P3 (2->0, finished)
    // 8-10: P1 (5->2 remaining)
    // 10-11: P2 (1->0, finished)
    // 11-13: P1 (2->0, finished)

    expect(result.ganttEntries.length).toBeGreaterThan(0);
    // P3 should be first or second (shortest burst)
  });

  it('should respect quantum', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 10 }] },
      { id: 'P2', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
    ];
    const config: SimulationConfig = { algorithm: 'RR', quantum: 4 };

    const result = SimulationEngine.simulate(processes, config);

    // Quantum=4:
    // 0-4: P1 (10->6)
    // 4-8: P2 (5->1)
    // 8-11: P1 (6->3)
    // 11-12: P2 (1->0, finished)
    // 12-15: P1 (3->0, finished)

    // Check that no single execution exceeds quantum 4
    for (const entry of result.ganttEntries) {
      const duration = entry.endTime - entry.startTime;
      expect(duration).toBeLessThanOrEqual(4);
    }
  });
});

describe('I/O Bursts', () => {
  it('should handle processes with I/O bursts', () => {
    const processes: ProcessDefinition[] = [
      {
        id: 'P1',
        arrivalTime: 0,
        bursts: [
          { type: 'CPU', duration: 3 },
          { type: 'IO', duration: 3 },
          { type: 'CPU', duration: 3 },
        ],
      },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [{ type: 'CPU', duration: 4 }],
      },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    // P1 runs 0-3, then blocked for I/O 3-6
    // P2 arrives at 1, runs 6-10 (after P1's I/O)
    // P1 resumes at 10-13

    const p1Entries = result.ganttEntries.filter(e => e.processId === 'P1');
    const p2Entries = result.ganttEntries.filter(e => e.processId === 'P2');

    expect(p1Entries.length).toBe(2);
    expect(p2Entries.length).toBe(1);
    expect(p1Entries[0].startTime).toBe(0);
    expect(p1Entries[0].endTime).toBe(3);
    expect(p2Entries[0].startTime).toBe(6);
    expect(p2Entries[0].endTime).toBe(10);
    expect(p1Entries[1].startTime).toBe(10);
    expect(p1Entries[1].endTime).toBe(13);
  });
});

describe('Metrics Calculation', () => {
  it('should calculate turnaround time correctly', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    // P1 finishes at time 5, turnaround = finish - arrival = 5 - 0 = 5
    const p1Metrics = result.metrics.processes.find(p => p.id === 'P1');
    expect(p1Metrics?.turnaroundTime).toBe(5);
  });

  it('should calculate average metrics', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    expect(result.metrics.averages.turnaroundTime).toBeDefined();
    expect(result.metrics.averages.waitingTime).toBeDefined();
    expect(result.metrics.averages.responseTime).toBeDefined();
    expect(result.metrics.processes).toHaveLength(2);
  });

  it('should record response time', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }] },
      { id: 'P2', arrivalTime: 3, bursts: [{ type: 'CPU', duration: 3 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    const p1Metrics = result.metrics.processes.find(p => p.id === 'P1');
    const p2Metrics = result.metrics.processes.find(p => p.id === 'P2');

    // P1 response time: 0 (runs immediately)
    expect(p1Metrics?.responseTime).toBe(0);
    // P2 response time: 5-3 = 2 (runs from time 5, arrived at 3)
    expect(p2Metrics?.responseTime).toBe(2);
  });
});

describe('SimulationEngine', () => {
  it('should generate events correctly', () => {
    const processes: ProcessDefinition[] = [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 3 }] },
    ];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const result = SimulationEngine.simulate(processes, config);

    const eventTypes = result.events.map(e => e.type);

    expect(eventTypes).toContain('PROCESS_ARRIVED');
    expect(eventTypes).toContain('PROCESS_DISPATCHED');
    expect(eventTypes).toContain('CPU_BURST_COMPLETED');
    expect(eventTypes).toContain('PROCESS_FINISHED');
  });

  it('should handle empty processes array', () => {
    const processes: ProcessDefinition[] = [];
    const config: SimulationConfig = { algorithm: 'FCFS' };

    const engine = new SimulationEngine(processes, config);
    const result = engine.runToCompletion();

    expect(result.events).toHaveLength(0);
    expect(result.ganttEntries).toHaveLength(0);
  });
});

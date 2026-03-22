import {
  ProcessDefinition,
  SimulationConfig,
  SimulationEvent,
  SimulationState,
  SimulationResult,
  MetricsSummary,
  Process,
} from '../types';
import { SchedulingAlgorithm, FCFSAlgorithm, SRTFAlgorithm, RRAlgorithm } from '../scheduling';

export class SimulationEngine {
  private state: SimulationState;
  private algorithm: SchedulingAlgorithm;
  private config: SimulationConfig;
  private maxIterations = 10000;
  private iterationCount = 0;

  constructor(processes: ProcessDefinition[], config: SimulationConfig) {
    this.config = config;
    this.algorithm = this.createAlgorithm(config);
    this.state = this.initializeState(processes);
    this.algorithm.init(this.state);
  }

  private createAlgorithm(config: SimulationConfig): SchedulingAlgorithm {
    switch (config.algorithm) {
      case "FCFS":
        return new FCFSAlgorithm();
      case "SRTF":
        return new SRTFAlgorithm();
      case "RR": {
        const rr = new RRAlgorithm();
        if (config.quantum !== undefined) {
          rr.setQuantum(config.quantum);
        }
        return rr;
      }
      default:
        throw new Error(`Unknown algorithm: ${config.algorithm}`);
    }
  }

  private initializeState(definitions: ProcessDefinition[]): SimulationState {
    const processes = new Map<string, Process>();

    for (const def of definitions) {
      const firstBurst = def.bursts[0];
      const process: Process = {
        id: def.id,
        arrivalTime: def.arrivalTime,
        bursts: def.bursts,
        currentBurstIndex: 0,
        remainingBurstTime: firstBurst?.type === "CPU" ? firstBurst.duration : 0,
        ioRemainingTime: 0,
        state: "NEW",
        totalCpuTime: def.bursts.filter(b => b.type === "CPU").reduce((sum, b) => sum + b.duration, 0),
        totalIoTime: def.bursts.filter(b => b.type === "IO").reduce((sum, b) => sum + b.duration, 0),
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: null,
        firstCpuTime: null,
      };
      processes.set(def.id, process);
    }

    return {
      time: 0,
      processes,
      readyQueue: [],
      blockedQueue: [],
      runningProcessId: null,
      cpuRemainingTime: 0,
      events: [],
      ganttEntries: [],
      currentGanttStart: null,
      finished: false,
    };
  }

  getState(): Readonly<SimulationState> {
    return this.state;
  }

  getConfig(): SimulationConfig {
    return this.config;
  }

  getCurrentTime(): number {
    return this.state.time;
  }

  isFinished(): boolean {
    return this.state.finished;
  }

  // Tick-based step - advance exactly 1 tick and return events that occurred
  tick(): SimulationEvent[] {
    const eventsAtThisTime: SimulationEvent[] = [];

    if (this.state.finished) {
      console.log('[Engine.tick] Already finished at t=', this.state.time);
      return eventsAtThisTime;
    }

    this.iterationCount++;
    if (this.iterationCount > this.maxIterations) {
      console.error('Simulation exceeded max iterations');
      this.state.finished = true;
      return eventsAtThisTime;
    }

    const currentTime = this.state.time;
    console.log('[Engine.tick] t=', currentTime, 'running=', this.state.runningProcessId, 'ready=', this.state.readyQueue, 'blocked=', this.state.blockedQueue);

    // 1. Process arrivals at this time
    for (const process of this.state.processes.values()) {
      if (process.state === "NEW" && process.arrivalTime === currentTime) {
        process.state = "READY";
        this.state.readyQueue.push(process.id);
        eventsAtThisTime.push({
          type: "PROCESS_ARRIVED",
          processId: process.id,
          time: currentTime,
        });
      }
    }

    // 2. If no process running, try to schedule one
    if (this.state.runningProcessId === null) {
      this.makeSchedulingDecision(eventsAtThisTime, currentTime);
    }

    // 3. If a process is running, decrement its time
    if (this.state.runningProcessId !== null) {
      const process = this.state.processes.get(this.state.runningProcessId);
      if (process) {
        process.remainingBurstTime--;
        this.state.cpuRemainingTime--;

        // Check if quantum expired (for RR)
        if (this.state.cpuRemainingTime <= 0 && this.config.algorithm === "RR") {
          // Quantum expired - check if burst also ended
          if (process.remainingBurstTime <= 0) {
            // Burst ended AND quantum expired - treat as burst completion
            this.completeCpuBurst(eventsAtThisTime, currentTime);
          } else {
            // Quantum expired but burst not done - preempt
            this.preemptCurrentProcess(eventsAtThisTime, currentTime);
          }
        } else if (process.remainingBurstTime <= 0) {
          // Burst completed (non-RR or burst ended before quantum)
          this.completeCpuBurst(eventsAtThisTime, currentTime);
        }
      }
    }

    // 4. Decrement IO time for blocked processes that were already in IO BEFORE this tick
    // Track the blocked queue BEFORE we potentially add new processes
    const blockedAtTickStart = [...this.state.blockedQueue];
    for (const pid of blockedAtTickStart) {
      const process = this.state.processes.get(pid);
      if (process) {
        process.ioRemainingTime--;
      }
    }

    // 5. Check IO completions
    const completedIO: string[] = [];
    for (const pid of this.state.blockedQueue) {
      const blockedProcess = this.state.processes.get(pid);
      if (blockedProcess && blockedProcess.ioRemainingTime <= 0) {
        completedIO.push(pid);
      }
    }
    for (const pid of completedIO) {
      this.completeIoBurst(pid, eventsAtThisTime, currentTime);
    }

    // 6. Advance time by 1
    this.state.time++;

    // 7. Update waiting time for ready processes
    for (const pid of this.state.readyQueue) {
      const process = this.state.processes.get(pid);
      if (process) {
        process.waitingTime++;
      }
    }

    // Check if all processes are finished
    const allFinished = Array.from(this.state.processes.values()).every(p => p.state === "FINISHED");
    if (allFinished) {
      this.state.finished = true;
      this.closeGanttEntry();
    }

    return eventsAtThisTime;
  }

  private makeSchedulingDecision(eventsAtThisTime: SimulationEvent[], currentTime: number): void {
    const nextProcessId = this.algorithm.decideNextProcess(this.state);
    if (nextProcessId) {
      this.dispatchProcess(nextProcessId, eventsAtThisTime, currentTime);
    }
  }

  private dispatchProcess(processId: string, eventsAtThisTime: SimulationEvent[], currentTime: number): void {
    const process = this.state.processes.get(processId);
    if (!process) return;

    // Remove from ready queue
    const idx = this.state.readyQueue.indexOf(processId);
    if (idx >= 0) {
      this.state.readyQueue.splice(idx, 1);
    }

    process.state = "RUNNING";
    this.state.runningProcessId = processId;

    const burst = process.bursts[process.currentBurstIndex];
    if (burst?.type !== "CPU") return;

    // Set response time on first CPU
    if (process.firstCpuTime === null) {
      process.firstCpuTime = currentTime - process.arrivalTime;
      process.responseTime = process.firstCpuTime;
    }

    // Determine how long this dispatch lasts (quantum or remaining burst, whichever is smaller)
    let burstDuration = process.remainingBurstTime;
    if (this.config.algorithm === "RR") {
      const rr = this.algorithm as RRAlgorithm;
      burstDuration = Math.min(burstDuration, rr.getQuantum());
    }
    this.state.cpuRemainingTime = burstDuration;
    this.state.currentGanttStart = currentTime;

    eventsAtThisTime.push({
      type: "PROCESS_DISPATCHED",
      processId,
      time: currentTime,
    });
  }

  private completeCpuBurst(eventsAtThisTime: SimulationEvent[], currentTime: number): void {
    const processId = this.state.runningProcessId;
    if (!processId) return;

    const process = this.state.processes.get(processId);
    if (!process) return;

    this.closeGanttEntry();

    eventsAtThisTime.push({
      type: "CPU_BURST_COMPLETED",
      processId,
      time: currentTime,
    });

    process.currentBurstIndex++;
    this.state.runningProcessId = null;
    this.state.cpuRemainingTime = 0;

    if (process.currentBurstIndex < process.bursts.length) {
      const nextBurst = process.bursts[process.currentBurstIndex];
      if (nextBurst.type === "IO") {
        process.state = "BLOCKED";
        process.ioRemainingTime = nextBurst.duration;
        this.state.blockedQueue.push(processId);
        // Add 1 because we'll decrement immediately in this tick
        process.ioRemainingTime = nextBurst.duration + 1;
        eventsAtThisTime.push({
          type: "IO_BURST_STARTED",
          processId,
          time: currentTime,
        });
      } else {
        process.state = "READY";
        process.remainingBurstTime = nextBurst.duration;
        this.state.readyQueue.push(processId);
      }
    } else {
      process.state = "FINISHED";
      process.turnaroundTime = currentTime - process.arrivalTime;
      eventsAtThisTime.push({
        type: "PROCESS_FINISHED",
        processId,
        time: currentTime,
      });
    }
  }

  private preemptCurrentProcess(eventsAtThisTime: SimulationEvent[], currentTime: number): void {
    const processId = this.state.runningProcessId;
    if (!processId) return;

    const process = this.state.processes.get(processId);
    if (!process) return;

    this.closeGanttEntry();

    eventsAtThisTime.push({
      type: "PROCESS_PREEMPTED",
      processId,
      time: currentTime,
    });

    process.state = "READY";
    this.state.readyQueue.push(processId);

    this.state.runningProcessId = null;
    this.state.cpuRemainingTime = 0;
  }

  private completeIoBurst(processId: string, eventsAtThisTime: SimulationEvent[], currentTime: number): void {
    const process = this.state.processes.get(processId);
    if (!process) return;

    const idx = this.state.blockedQueue.indexOf(processId);
    if (idx >= 0) {
      this.state.blockedQueue.splice(idx, 1);
    }

    // IO burst completed - move to next burst
    process.currentBurstIndex++;

    process.state = "READY";
    const nextBurst = process.bursts[process.currentBurstIndex];
    if (nextBurst && nextBurst.type === "CPU") {
      process.remainingBurstTime = nextBurst.duration;
    }
    this.state.readyQueue.push(processId);

    eventsAtThisTime.push({
      type: "IO_BURST_COMPLETED",
      processId,
      time: currentTime,
    });
  }

  private closeGanttEntry(): void {
    // The gantt entry should end at the CURRENT time (after time advances, state.time will be currentTime + 1)
    // But since we close BEFORE advancing, we use state.time + 1
    if (this.state.currentGanttStart !== null && this.state.runningProcessId !== null) {
      this.state.ganttEntries.push({
        processId: this.state.runningProcessId,
        startTime: this.state.currentGanttStart,
        endTime: this.state.time + 1,
      });
      this.state.currentGanttStart = null;
    }
  }

  // Run one tick at a time - used for interactive mode
  step(): SimulationEvent[] {
    const events = this.tick();
    return events;
  }

  // Run to completion for batch mode
  runToCompletion(): SimulationResult {
    this.iterationCount = 0;

    while (!this.state.finished) {
      this.tick();
      if (this.iterationCount > this.maxIterations) {
        console.error('Simulation exceeded max iterations');
        break;
      }
    }

    if (this.state.currentGanttStart !== null && this.state.runningProcessId !== null) {
      this.state.ganttEntries.push({
        processId: this.state.runningProcessId,
        startTime: this.state.currentGanttStart,
        endTime: this.state.time,
      });
    }

    console.log('[Engine] Total ticks:', this.state.time);
    console.log('[Engine] Total events:', this.state.events.length);
    console.log('[Engine] First 30 events:');
    for (let i = 0; i < Math.min(30, this.state.events.length); i++) {
      const e = this.state.events[i];
      const pid = 'processId' in e ? e.processId : '';
      console.log(`  [${i}] t=${e.time} ${e.type}${pid ? ` ${pid}` : ''}`);
    }

    return this.getResult();
  }

  getResult(): SimulationResult {
    const processes = Array.from(this.state.processes.values());
    const metrics: MetricsSummary = {
      processes: processes.map(p => ({
        id: p.id,
        waitingTime: p.waitingTime,
        turnaroundTime: p.turnaroundTime || (this.state.time - p.arrivalTime),
        responseTime: p.responseTime || 0,
      })),
      averages: {
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: 0,
      },
    };

    const count = metrics.processes.length;
    if (count > 0) {
      metrics.averages.waitingTime = metrics.processes.reduce((sum, p) => sum + p.waitingTime, 0) / count;
      metrics.averages.turnaroundTime = metrics.processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / count;
      metrics.averages.responseTime = metrics.processes.reduce((sum, p) => sum + p.responseTime, 0) / count;
    }

    return {
      events: [...this.state.events],
      metrics,
      ganttEntries: [...this.state.ganttEntries],
    };
  }

  static simulate(processes: ProcessDefinition[], config: SimulationConfig): SimulationResult {
    const engine = new SimulationEngine(processes, config);
    return engine.runToCompletion();
  }
}
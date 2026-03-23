import {
  ProcessDefinition,
  SimulationConfig,
  SimulationEvent,
  SimulationResult,
  MetricsSummary,
  GanttEntry,
  Process,
  StateSnapshot,
  ProcessSnapshot,
} from '../types';
import { SchedulingAlgorithm, SchedulingState, ProcessInfo, FCFSAlgorithm, SRTFAlgorithm, RRAlgorithm } from '../scheduling';

export class SimulationEngine {
  // Configuration
  private config: SimulationConfig;
  private algorithm: SchedulingAlgorithm;
  private quantum: number | null;

  // Mutable simulation state
  private time: number = 0;
  private processes: Map<string, Process> = new Map();
  private readyQueue: string[] = [];
  private blockedQueue: string[] = [];
  private runningProcessId: string | null = null;
  private finished: boolean = false;

  // Gantt chart tracking
  private ganttEntries: GanttEntry[] = [];
  private currentGanttStart: number | null = null;
  private runningDispatchEnd: number | null = null; // When current dispatch will end
  private ioGanttStart: Map<string, number> = new Map(); // processId -> startTime

  // Event log
  private events: SimulationEvent[] = [];

  constructor(processes: ProcessDefinition[], config: SimulationConfig) {
    this.config = config;
    this.quantum = config.algorithm === "RR" ? (config.quantum ?? 4) : null;
    this.algorithm = this.createAlgorithm(config);
    this.initializeProcesses(processes);
  }

  private createAlgorithm(config: SimulationConfig): SchedulingAlgorithm {
    switch (config.algorithm) {
      case "FCFS":
        return new FCFSAlgorithm();
      case "SRTF":
        return new SRTFAlgorithm();
      case "RR":
        return new RRAlgorithm(this.quantum!);
      default:
        throw new Error(`Unknown algorithm: ${config.algorithm}`);
    }
  }

  private initializeProcesses(definitions: ProcessDefinition[]): void {
    for (const def of definitions) {
      const firstBurst = def.bursts[0];
      const totalCpuTime = def.bursts
        .filter(b => b.type === "CPU")
        .reduce((sum, b) => sum + b.duration, 0);
      const totalIoTime = def.bursts
        .filter(b => b.type === "IO")
        .reduce((sum, b) => sum + b.duration, 0);

      const process: Process = {
        id: def.id,
        arrivalTime: def.arrivalTime,
        bursts: def.bursts,
        currentBurstIndex: 0,
        remainingBurstTime: firstBurst?.type === "CPU" ? firstBurst.duration : 0,
        ioRemainingTime: 0,
        ioBurstDuration: 0,
        state: "NEW",
        totalCpuTime,
        totalIoTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: null,
        firstCpuTime: null,
        quantumUsed: 0,
      };
      this.processes.set(def.id, process);
    }
  }

  // ============================================
  // Core Tick Method - EXACT SEQUENCE
  // ============================================

  tick(): StateSnapshot {
    if (this.finished) {
      return this.createSnapshot();
    }

    // STEP 1: Handle arrivals at current time
    this.handleArrivals();

    // STEP 2: If no process running, call scheduler
    if (this.runningProcessId === null) {
      this.schedule();
    }

    // STEP 3: Execute current process for exactly 1 tick
    if (this.runningProcessId !== null) {
      this.executeRunningProcess();
    }

    // STEP 4: Decrement IO time for blocked processes
    this.decrementBlockedProcesses();

    // STEP 5: Check for IO completions and move to ready
    this.handleIOCompletions();

    // STEP 6: Advance time by 1
    this.time++;

    // STEP 7: Increment waiting time for all READY processes
    this.incrementWaitingTimes();

    // STEP 8: Check if all processes are FINISHED
    if (this.checkAllFinished()) {
      this.finished = true;
    }

    return this.createSnapshot();
  }

  // ============================================
  // Step 1: Handle Arrivals
  // ============================================

  private handleArrivals(): void {
    for (const [id, process] of this.processes) {
      if (process.state === "NEW" && process.arrivalTime === this.time) {
        process.state = "READY";
        this.readyQueue.push(id);
        this.addEvent({ type: "PROCESS_ARRIVED", processId: id, time: this.time });
      }
    }
  }

  // ============================================
  // Step 2: Schedule (if no process running)
  // ============================================

  private schedule(): void {
    const nextProcessId = this.algorithm.decideNextProcess(this.buildSchedulingState());
    if (nextProcessId) {
      this.dispatchProcess(nextProcessId);
    }
  }

  // ============================================
  // Step 3: Execute Running Process
  // ============================================

  private executeRunningProcess(): void {
    const process = this.processes.get(this.runningProcessId!);
    if (!process) return;

    const burst = process.bursts[process.currentBurstIndex];
    if (!burst || burst.type !== "CPU") return;

    // Consume exactly 1 tick of CPU time
    process.remainingBurstTime--;
    process.quantumUsed++;

    // Check for quantum expiration (RR only)
    if (this.quantum !== null && process.quantumUsed >= this.quantum) {
      if (process.remainingBurstTime > 0) {
        // Quantum expired but burst not complete -> preempt
        this.preemptProcess();
        return;
      }
    }

    // Check if burst completed
    if (process.remainingBurstTime === 0) {
      this.completeCpuBurst();
    }
  }

  // ============================================
  // Step 4: Decrement Blocked Processes
  // ============================================

  private decrementBlockedProcesses(): void {
    for (const pid of this.blockedQueue) {
      const proc = this.processes.get(pid);
      if (proc) {
        proc.ioRemainingTime--;
      }
    }
  }

  // ============================================
  // Step 5: Handle IO Completions
  // ============================================

  private handleIOCompletions(): void {
    const completedIO: string[] = [];

    for (const pid of this.blockedQueue) {
      const proc = this.processes.get(pid);
      if (proc && proc.ioRemainingTime === 0) {
        completedIO.push(pid);
      }
    }

    for (const pid of completedIO) {
      this.completeIO(pid);
    }
  }

  // ============================================
  // Step 7: Increment Waiting Times
  // ============================================

  private incrementWaitingTimes(): void {
    for (const pid of this.readyQueue) {
      const proc = this.processes.get(pid);
      if (proc) {
        proc.waitingTime++;
      }
    }
  }

  // ============================================
  // Process State Transitions
  // ============================================

  private dispatchProcess(processId: string): void {
    const process = this.processes.get(processId);
    if (!process) return;

    // Remove from ready queue
    const idx = this.readyQueue.indexOf(processId);
    if (idx >= 0) {
      this.readyQueue.splice(idx, 1);
    }

    process.state = "RUNNING";
    process.quantumUsed = 0;  // Reset quantum counter for RR
    this.runningProcessId = processId;
    this.currentGanttStart = this.time;

    // Calculate when this dispatch will end
    if (this.quantum !== null) {
      // RR: dispatch ends at quantum expiration or burst completion
      this.runningDispatchEnd = this.time + Math.min(this.quantum, process.remainingBurstTime);
    } else {
      // FCFS/SRTF: dispatch ends when burst completes
      this.runningDispatchEnd = this.time + process.remainingBurstTime;
    }

    // Set response time on first CPU
    if (process.firstCpuTime === null) {
      process.firstCpuTime = this.time;
      process.responseTime = this.time - process.arrivalTime;
    }

    this.addEvent({ type: "PROCESS_DISPATCHED", processId, time: this.time });
  }

  private preemptProcess(): void {
    const processId = this.runningProcessId;
    if (!processId) return;

    const process = this.processes.get(processId);
    if (!process) return;

    // Close Gantt entry
    this.closeGanttEntry();

    this.addEvent({ type: "PROCESS_PREEMPTED", processId, time: this.time });

    process.state = "READY";
    this.readyQueue.push(processId);
    this.runningProcessId = null;
    this.currentGanttStart = null;
    this.runningDispatchEnd = null;
  }

  private completeCpuBurst(): void {
    const processId = this.runningProcessId;
    if (!processId) return;

    const process = this.processes.get(processId);
    if (!process) return;

    // Close Gantt entry
    this.closeGanttEntry();

    this.addEvent({ type: "CPU_BURST_COMPLETED", processId, time: this.time });

    process.currentBurstIndex++;
    this.runningProcessId = null;
    this.currentGanttStart = null;
    this.runningDispatchEnd = null;

    if (process.currentBurstIndex < process.bursts.length) {
      const nextBurst = process.bursts[process.currentBurstIndex];

      if (nextBurst.type === "IO") {
        // Start IO burst - duration is exact
        process.state = "BLOCKED";
        process.ioRemainingTime = nextBurst.duration;
        process.ioBurstDuration = nextBurst.duration; // Store original duration for rendering
        this.blockedQueue.push(processId);
        // Track IO in Gantt - start at next tick (current time + 1)
        // so IO appears to start AFTER CPU burst ends visually
        this.ioGanttStart.set(processId, this.time + 1);
        this.addEvent({ type: "IO_BURST_STARTED", processId, time: this.time });
      } else {
        // Next CPU burst
        process.state = "READY";
        process.remainingBurstTime = nextBurst.duration;
        this.readyQueue.push(processId);
      }
    } else {
      // Process finished - finish time is this.time + 1 (end of current tick)
      process.state = "FINISHED";
      process.turnaroundTime = (this.time + 1) - process.arrivalTime;
      this.addEvent({ type: "PROCESS_FINISHED", processId, time: this.time });
    }
  }

  private completeIO(processId: string): void {
    const process = this.processes.get(processId);
    if (!process) return;

    // Close IO Gantt entry using stored start and duration
    const ioStart = this.ioGanttStart.get(processId);
    if (ioStart !== undefined) {
      // endTime = start + duration (not this.time + 1 which would be wrong)
      this.ganttEntries.push({
        processId,
        startTime: ioStart,
        endTime: ioStart + process.ioBurstDuration,
        type: "IO",
      });
      this.ioGanttStart.delete(processId);
    }

    // Remove from blocked queue
    const idx = this.blockedQueue.indexOf(processId);
    if (idx >= 0) {
      this.blockedQueue.splice(idx, 1);
    }

    // Move to next burst
    process.currentBurstIndex++;

    const nextBurst = process.bursts[process.currentBurstIndex];
    if (nextBurst && nextBurst.type === "CPU") {
      process.state = "READY";
      process.remainingBurstTime = nextBurst.duration;
      this.readyQueue.push(processId);
    }

    this.addEvent({ type: "IO_BURST_COMPLETED", processId, time: this.time });
  }

  // ============================================
  // Helper Methods
  // ============================================

  private buildSchedulingState(): SchedulingState {
    const processInfos = new Map<string, ProcessInfo>();

    for (const [id, proc] of this.processes) {
      let totalRemainingCpu = proc.remainingBurstTime;

      // Add future CPU bursts
      for (let i = proc.currentBurstIndex + 1; i < proc.bursts.length; i++) {
        const burst = proc.bursts[i];
        if (burst.type === "CPU") {
          totalRemainingCpu += burst.duration;
        }
      }

      processInfos.set(id, { id, remainingCpuTime: totalRemainingCpu });
    }

    return {
      time: this.time,
      readyQueue: [...this.readyQueue],
      blockedQueue: [...this.blockedQueue],
      runningProcessId: this.runningProcessId,
      processInfos,
    };
  }

  private closeGanttEntry(): void {
    if (this.currentGanttStart !== null && this.runningProcessId !== null) {
      // endTime is this.time + 1 because this.time hasn't been incremented yet
      // and the CPU is busy until the end of the current tick
      this.ganttEntries.push({
        processId: this.runningProcessId,
        startTime: this.currentGanttStart,
        endTime: this.time + 1,
        type: "CPU",
      });
      this.currentGanttStart = null;
    }
  }

  private checkAllFinished(): boolean {
    for (const proc of this.processes.values()) {
      if (proc.state !== "FINISHED") {
        return false;
      }
    }
    return true;
  }

  private addEvent(event: SimulationEvent): void {
    this.events.push(event);
  }

  private createSnapshot(): StateSnapshot {
    const processSnapshots = new Map<string, ProcessSnapshot>();
    for (const [id, proc] of this.processes) {
      processSnapshots.set(id, {
        id: proc.id,
        state: proc.state,
        currentBurstIndex: proc.currentBurstIndex,
        remainingBurstTime: proc.remainingBurstTime,
        ioRemainingTime: proc.ioRemainingTime,
        ioBurstDuration: proc.ioBurstDuration,
        waitingTime: proc.waitingTime,
        turnaroundTime: proc.turnaroundTime,
        responseTime: proc.responseTime,
        firstCpuTime: proc.firstCpuTime,
      });
    }
    return {
      time: this.time,
      processes: processSnapshots,
      readyQueue: [...this.readyQueue],
      blockedQueue: [...this.blockedQueue],
      runningProcessId: this.runningProcessId,
      ganttEntries: [...this.ganttEntries],
      currentGanttStart: this.currentGanttStart,
      runningDispatchEnd: this.runningDispatchEnd,
      ioSnapshotStarts: new Map(this.ioGanttStart),
    };
  }

  // ============================================
  // Public API
  // ============================================

  getCurrentSnapshot(): StateSnapshot {
    return this.createSnapshot();
  }

  getTime(): number {
    return this.time;
  }

  isFinished(): boolean {
    return this.finished;
  }

  getEvents(): SimulationEvent[] {
    return [...this.events];
  }

  runToCompletion(): SimulationResult {
    while (!this.finished) {
      this.tick();
    }

    // Close any open Gantt entry at termination
    if (this.currentGanttStart !== null && this.runningProcessId !== null) {
      this.ganttEntries.push({
        processId: this.runningProcessId,
        startTime: this.currentGanttStart,
        endTime: this.time + 1,
        type: "CPU",
      });
    }

    const processList = Array.from(this.processes.values());
    const metrics: MetricsSummary = {
      processes: processList.map(p => ({
        id: p.id,
        waitingTime: p.waitingTime,
        turnaroundTime: p.turnaroundTime,
        responseTime: p.responseTime ?? 0,
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
      events: [...this.events],
      metrics,
      ganttEntries: [...this.ganttEntries],
    };
  }

  static simulate(processes: ProcessDefinition[], config: SimulationConfig): SimulationResult {
    const engine = new SimulationEngine(processes, config);
    return engine.runToCompletion();
  }
}

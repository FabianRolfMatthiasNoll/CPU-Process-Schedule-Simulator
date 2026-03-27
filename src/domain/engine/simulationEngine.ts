import {
  ProcessDefinition,
  SimulationConfig,
  SimulationResult,
  MetricsSummary,
  GanttEntry,
  Process,
  StateSnapshot,
  ProcessSnapshot,
} from '../types';
import { SchedulingAlgorithm, SchedulingState, ProcessInfo, FCFSAlgorithm, SJFAlgorithm, LJFAlgorithm, SRTFAlgorithm, LRTFAlgorithm, RRAlgorithm, PriorityAlgorithm, HRRNAlgorithm } from '../scheduling';

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

  // Gantt chart tracking - per-tick entries
  private ganttEntries: GanttEntry[] = [];

  // Last scheduling decision for UI explanation
  private schedulingDecision: { reason: string; selectedProcessId: string | null; alternatives?: string[] } | undefined;

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
      case "SJF":
        return new SJFAlgorithm();
      case "LJF":
        return new LJFAlgorithm();
      case "SRTF":
        return new SRTFAlgorithm();
      case "LRTF":
        return new LRTFAlgorithm();
      case "RR":
        return new RRAlgorithm(this.quantum!);
      case "Priority":
        return new PriorityAlgorithm(config.preemptive ?? true);
      case "HRRN":
        return new HRRNAlgorithm();
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
        burstStartTime: 0,
        state: "NEW",
        totalCpuTime,
        totalIoTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: null,
        firstCpuTime: null,
        quantumUsed: 0,
        priority: def.priority,
      };
      this.processes.set(def.id, process);
    }
  }

  tick(): StateSnapshot {
    if (this.finished) {
      return this.createSnapshot();
    }

    const currentTime = this.time;

    // Capture blocked queue and running process BEFORE we make changes this tick
    // Only processes that were blocked BEFORE this tick should record an IO tick
    const previouslyBlocked = [...this.blockedQueue];
    const cpuProcessId = this.runningProcessId; // Who ran CPU BEFORE executeRunningProcess

    // STEP 1: Handle arrivals at current time
    this.handleArrivals();

    // STEP 2: Call scheduler (handles preemption for SRTF, or just picks next for FCFS/RR)
    this.schedule();

    // STEP 3: Execute current process for exactly 1 tick
    if (this.runningProcessId !== null) {
      this.executeRunningProcess();
    }

    // STEP 4: Decrement IO time for blocked processes and record IO ticks
    // Only processes that were blocked BEFORE this tick ran IO during [currentTime, currentTime+1)
    // Skip a process if it ran CPU this tick (cpuProcessId) - it can't also do IO this tick
    for (const pid of previouslyBlocked) {
      // Skip if this process ran CPU this tick - it can't also do IO in same tick
      if (pid === cpuProcessId) continue;

      const proc = this.processes.get(pid);
      if (proc) {
        proc.remainingBurstTime--;
        // Record IO tick: [currentTime, currentTime + 1)
        this.ganttEntries.push({
          processId: pid,
          startTime: currentTime,
          endTime: currentTime + 1,
          type: "IO",
        });
      }
    }

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
      }
    }
  }

  // ============================================
  // Step 2: Schedule
  // ============================================

  private schedule(): void {
    const stateBefore = this.buildSchedulingState();
    const nextProcessId = this.algorithm.decideNextProcess(stateBefore);
    if (!nextProcessId) {
      this.schedulingDecision = {
        reason: "No process available - CPU idle",
        selectedProcessId: null,
      };
      return;
    }

    // Compute explanation based on algorithm and state
    this.schedulingDecision = this.buildSchedulingDecision(
      this.algorithm.name,
      nextProcessId,
      stateBefore
    );

    // If same process is running, nothing to do
    if (this.runningProcessId === nextProcessId) {
      return;
    }

    // If there's a running process, preempt it first
    if (this.runningProcessId !== null && this.runningProcessId !== nextProcessId) {
      this.preemptProcess();
    }

    this.dispatchProcess(nextProcessId);
  }

  private buildSchedulingDecision(
    algorithmName: string,
    selectedId: string,
    state: SchedulingState
  ): { reason: string; selectedProcessId: string | null; alternatives?: string[] } {
    const selectedInfo = state.processInfos.get(selectedId);
    const runningInfo = state.runningProcessId ? state.processInfos.get(state.runningProcessId) : null;

    switch (algorithmName) {
      case "FCFS": {
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (FCFS: no preemption)`, selectedProcessId: selectedId };
        }
        const alternatives = state.readyQueue.filter(id => id !== selectedId).map(id => {
          const info = state.processInfos.get(id);
          return `${id} (remaining: ${info?.remainingCpuTime ?? '?'})`;
        });
        return {
          reason: `${selectedId} starts (FCFS: first in queue)`,
          selectedProcessId: selectedId,
          alternatives,
        };
      }

      case "SJF": {
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (SJF: non-preemptive)`, selectedProcessId: selectedId };
        }
        const alternatives = state.readyQueue.filter(id => id !== selectedId).map(id => {
          const info = state.processInfos.get(id);
          return `${id} (remaining: ${info?.remainingCpuTime ?? '?'})`;
        });
        return {
          reason: `${selectedId} starts (SJF: shortest remaining: ${selectedInfo?.remainingCpuTime})`,
          selectedProcessId: selectedId,
          alternatives,
        };
      }

      case "LJF": {
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (LJF: non-preemptive)`, selectedProcessId: selectedId };
        }
        const alternatives = state.readyQueue.filter(id => id !== selectedId).map(id => {
          const info = state.processInfos.get(id);
          return `${id} (remaining: ${info?.remainingCpuTime ?? '?'})`;
        });
        return {
          reason: `${selectedId} starts (LJF: longest remaining: ${selectedInfo?.remainingCpuTime})`,
          selectedProcessId: selectedId,
          alternatives,
        };
      }

      case "SRTF": {
        if (state.runningProcessId !== null && state.runningProcessId !== selectedId) {
          const runningTime = runningInfo?.remainingCpuTime ?? 0;
          const selectedTime = selectedInfo?.remainingCpuTime ?? 0;
          return {
            reason: `${selectedId} preempts ${state.runningProcessId} (SRTF: ${selectedTime} < ${runningTime})`,
            selectedProcessId: selectedId,
            alternatives: [`${state.runningProcessId} (remaining: ${runningTime})`],
          };
        }
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (SRTF: shortest remaining)`, selectedProcessId: selectedId };
        }
        return {
          reason: `${selectedId} starts (SRTF: shortest remaining: ${selectedInfo?.remainingCpuTime})`,
          selectedProcessId: selectedId,
        };
      }

      case "LRTF": {
        if (state.runningProcessId !== null && state.runningProcessId !== selectedId) {
          const runningTime = runningInfo?.remainingCpuTime ?? 0;
          const selectedTime = selectedInfo?.remainingCpuTime ?? 0;
          return {
            reason: `${selectedId} preempts ${state.runningProcessId} (LRTF: ${selectedTime} > ${runningTime})`,
            selectedProcessId: selectedId,
            alternatives: [`${state.runningProcessId} (remaining: ${runningTime})`],
          };
        }
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (LRTF: longest remaining)`, selectedProcessId: selectedId };
        }
        return {
          reason: `${selectedId} starts (LRTF: longest remaining: ${selectedInfo?.remainingCpuTime})`,
          selectedProcessId: selectedId,
        };
      }

      case "RR": {
        return {
          reason: `${selectedId} runs (Round Robin)`,
          selectedProcessId: selectedId,
        };
      }

      case "Priority": {
        const preemptive = this.config.preemptive ?? true;
        if (state.runningProcessId !== null && state.runningProcessId !== selectedId) {
          const runningPri = runningInfo?.priority ?? Infinity;
          const selectedPri = selectedInfo?.priority ?? Infinity;
          if (preemptive) {
            return {
              reason: `${selectedId} preempts ${state.runningProcessId} (Priority: ${selectedPri} < ${runningPri})`,
              selectedProcessId: selectedId,
              alternatives: [`${state.runningProcessId} (priority: ${runningPri})`],
            };
          } else {
            return {
              reason: `${state.runningProcessId} continues (Priority: non-preemptive)`,
              selectedProcessId: state.runningProcessId,
              alternatives: [`${selectedId} (priority: ${selectedPri}, waiting)`],
            };
          }
        }
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (Priority: no higher priority)`, selectedProcessId: selectedId };
        }
        return {
          reason: `${selectedId} starts (Priority: ${selectedInfo?.priority})`,
          selectedProcessId: selectedId,
        };
      }

      case "HRRN": {
        if (state.runningProcessId !== null) {
          return { reason: `${selectedId} continues (HRRN: non-preemptive)`, selectedProcessId: selectedId };
        }
        const waitingTime = selectedInfo?.waitingTime ?? 0;
        const burstTime = selectedInfo?.remainingCpuTime ?? 1;
        const responseRatio = ((waitingTime + burstTime) / burstTime).toFixed(2);
        const alternatives = state.readyQueue.filter(id => id !== selectedId).map(id => {
          const info = state.processInfos.get(id);
          const wt = info?.waitingTime ?? 0;
          const bt = info?.remainingCpuTime ?? 1;
          return `${id} (RR: ${((wt + bt) / bt).toFixed(2)})`;
        });
        return {
          reason: `${selectedId} starts (HRRN: RR=${responseRatio})`,
          selectedProcessId: selectedId,
          alternatives,
        };
      }

      default:
        return { reason: `${selectedId} selected`, selectedProcessId: selectedId };
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

    // Record CPU tick: [this.time, this.time + 1)
    this.ganttEntries.push({
      processId: process.id,
      startTime: this.time,
      endTime: this.time + 1,
      type: "CPU",
    });

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
      this.completeCurrentBurst();
    }
  }

  // ============================================
  // Step 5: Handle IO Completions
  // ============================================

  private handleIOCompletions(): void {
    const completedIO: string[] = [];

    for (const pid of this.blockedQueue) {
      const proc = this.processes.get(pid);
      if (proc && proc.remainingBurstTime === 0) {
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
    process.quantumUsed = 0;
    process.burstStartTime = this.time;
    this.runningProcessId = processId;

    // Set response time on first CPU
    if (process.firstCpuTime === null) {
      process.firstCpuTime = this.time;
      process.responseTime = this.time - process.arrivalTime;
    }
  }

  private preemptProcess(): void {
    const processId = this.runningProcessId;
    if (!processId) return;

    const process = this.processes.get(processId);
    if (!process) return;

    process.state = "READY";
    this.readyQueue.push(processId);
    this.runningProcessId = null;
  }

  private completeCurrentBurst(): void {
    const processId = this.runningProcessId;
    if (!processId) return;

    const process = this.processes.get(processId);
    if (!process) return;

    // Move to next burst
    process.currentBurstIndex++;
    this.runningProcessId = null;

    if (process.currentBurstIndex < process.bursts.length) {
      const nextBurst = process.bursts[process.currentBurstIndex];

      if (nextBurst.type === "IO") {
        process.state = "BLOCKED";
        process.remainingBurstTime = nextBurst.duration;
        process.burstStartTime = this.time + 1; // Will execute starting next tick
        this.blockedQueue.push(processId);
      } else {
        // Next CPU burst - will run immediately in this tick
        process.state = "READY";
        process.remainingBurstTime = nextBurst.duration;
        process.burstStartTime = this.time; // CPU runs immediately
        this.readyQueue.push(processId);
      }
    } else {
      // Process finished
      process.state = "FINISHED";
      process.turnaroundTime = (this.time + 1) - process.arrivalTime;
    }
  }

  private completeIO(processId: string): void {
    const process = this.processes.get(processId);
    if (!process) return;

    // Remove from blocked queue
    const idx = this.blockedQueue.indexOf(processId);
    if (idx >= 0) {
      this.blockedQueue.splice(idx, 1);
    }

    // Move to next burst
    process.currentBurstIndex++;

    if (process.currentBurstIndex < process.bursts.length) {
      const nextBurst = process.bursts[process.currentBurstIndex];
      if (nextBurst.type === "CPU") {
        process.state = "READY";
        process.remainingBurstTime = nextBurst.duration;
        process.burstStartTime = this.time + 1; // Will be set when dispatched
        this.readyQueue.push(processId);
      }
    }
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

      processInfos.set(id, { id, remainingCpuTime: totalRemainingCpu, priority: proc.priority, waitingTime: proc.waitingTime });
    }

    return {
      time: this.time,
      readyQueue: [...this.readyQueue],
      blockedQueue: [...this.blockedQueue],
      runningProcessId: this.runningProcessId,
      processInfos,
    };
  }

  private checkAllFinished(): boolean {
    for (const proc of this.processes.values()) {
      if (proc.state !== "FINISHED") {
        return false;
      }
    }
    return true;
  }

  private createSnapshot(): StateSnapshot {
    const processSnapshots = new Map<string, ProcessSnapshot>();
    for (const [id, proc] of this.processes) {
      processSnapshots.set(id, {
        id: proc.id,
        state: proc.state,
        currentBurstIndex: proc.currentBurstIndex,
        remainingBurstTime: proc.remainingBurstTime,
        burstStartTime: proc.burstStartTime,
        waitingTime: proc.waitingTime,
        turnaroundTime: proc.turnaroundTime,
        responseTime: proc.responseTime,
        firstCpuTime: proc.firstCpuTime,
      });
    }

    // Find processes arriving at the current snapshot time
    const currentTickArrivals: string[] = [];
    for (const [id, proc] of this.processes) {
      if (proc.arrivalTime === this.time) {
        currentTickArrivals.push(id);
      }
    }

    return {
      time: this.time,
      processes: processSnapshots,
      readyQueue: [...this.readyQueue],
      blockedQueue: [...this.blockedQueue],
      runningProcessId: this.runningProcessId,
      ganttEntries: [...this.ganttEntries],
      currentTickArrivals,
      schedulingDecision: this.schedulingDecision,
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

  runToCompletion(): SimulationResult {
    while (!this.finished) {
      this.tick();
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
      metrics,
      ganttEntries: [...this.ganttEntries],
    };
  }

  static simulate(processes: ProcessDefinition[], config: SimulationConfig): SimulationResult {
    const engine = new SimulationEngine(processes, config);
    return engine.runToCompletion();
  }
}
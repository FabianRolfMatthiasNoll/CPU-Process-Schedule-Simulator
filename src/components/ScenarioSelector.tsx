import { useSimulationStore } from '../application';
import { ProcessDefinition } from '../domain/types';

interface Scenario {
  name: string;
  description: string;
  processes: ProcessDefinition[];
  algorithm: 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'Priority';
  quantum?: number;
  preemptive?: boolean;
}

const SCENARIOS: Scenario[] = [
  {
    name: 'Generic I/O',
    description: '4 processes with CPU-IO-CPU bursts, staggered arrivals',
    algorithm: 'FCFS',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 4 }] },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [
          { type: 'CPU', duration: 3 },
          { type: 'IO', duration: 4 },
          { type: 'CPU', duration: 2 },
        ],
      },
      {
        id: 'P3',
        arrivalTime: 2,
        bursts: [
          { type: 'CPU', duration: 2 },
          { type: 'IO', duration: 3 },
          { type: 'CPU', duration: 3 },
        ],
      },
      {
        id: 'P4',
        arrivalTime: 3,
        bursts: [
          { type: 'CPU', duration: 4 },
          { type: 'IO', duration: 2 },
          { type: 'CPU', duration: 2 },
        ],
      },
    ],
  },
  {
    name: 'Stalling CPU',
    description: 'Long IO bursts cause CPU to stall - P2 and P3 have extended IO periods',
    algorithm: 'FCFS',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 4 }] },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [
          { type: 'CPU', duration: 3 },
          { type: 'IO', duration: 7 },
          { type: 'CPU', duration: 2 },
        ],
      },
      {
        id: 'P3',
        arrivalTime: 2,
        bursts: [
          { type: 'CPU', duration: 2 },
          { type: 'IO', duration: 6 },
          { type: 'CPU', duration: 3 },
        ],
      },
      {
        id: 'P4',
        arrivalTime: 3,
        bursts: [
          { type: 'CPU', duration: 4 },
          { type: 'IO', duration: 2 },
          { type: 'CPU', duration: 2 },
        ],
      },
    ],
  },
  {
    name: 'SRTF Preemption',
    description: 'Shortest remaining time process preempts longer one when it arrives',
    algorithm: 'SRTF',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }] },
      { id: 'P2', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 4, bursts: [{ type: 'CPU', duration: 2 }] },
    ],
  },
  {
    name: 'FCFS with I/O',
    description: 'CPU and I/O bursts - P1 blocks while P2 runs',
    algorithm: 'FCFS',
    processes: [
      {
        id: 'P1',
        arrivalTime: 0,
        bursts: [
          { type: 'CPU', duration: 3 },
          { type: 'IO', duration: 4 },
          { type: 'CPU', duration: 3 },
        ],
      },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [{ type: 'CPU', duration: 4 }],
      },
      {
        id: 'P3',
        arrivalTime: 2,
        bursts: [{ type: 'CPU', duration: 2 }],
      },
    ],
  },
  {
    name: 'Round Robin',
    description: 'Time-sharing with quantum=3 - each process gets fair CPU time',
    algorithm: 'RR',
    quantum: 3,
    processes: [
      {
        id: 'P1',
        arrivalTime: 0,
        bursts: [{ type: 'CPU', duration: 6 }],
      },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [{ type: 'CPU', duration: 4 }],
      },
      {
        id: 'P3',
        arrivalTime: 2,
        bursts: [{ type: 'CPU', duration: 3 }],
      },
    ],
  },
  {
    name: 'SJF (Non-Preemptive)',
    description: 'Shortest job is selected when CPU becomes free - no preemption',
    algorithm: 'SJF',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 6 }] },
    ],
  },
  {
    name: 'Priority (Preemptive)',
    description: 'Higher priority process preempts lower one',
    algorithm: 'Priority',
    preemptive: true,
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }], priority: 2 },
      { id: 'P2', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 3 }], priority: 1 },
      { id: 'P3', arrivalTime: 3, bursts: [{ type: 'CPU', duration: 4 }], priority: 3 },
    ],
  },
  {
    name: 'Priority (Non-Preemptive)',
    description: 'Higher priority waits until CPU is idle',
    algorithm: 'Priority',
    preemptive: false,
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 6 }], priority: 2 },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }], priority: 1 },
      { id: 'P3', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 4 }], priority: 3 },
    ],
  },
  {
    name: 'I/O Bound Process',
    description: 'Process alternates between CPU and I/O multiple times',
    algorithm: 'FCFS',
    processes: [
      {
        id: 'P1',
        arrivalTime: 0,
        bursts: [
          { type: 'CPU', duration: 2 },
          { type: 'IO', duration: 5 },
          { type: 'CPU', duration: 2 },
          { type: 'IO', duration: 3 },
          { type: 'CPU', duration: 2 },
        ],
      },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [{ type: 'CPU', duration: 6 }],
      },
    ],
  },
  {
    name: 'Complex SRTF',
    description: 'Many short processes interrupt a long one - shows SRTF efficiency',
    algorithm: 'SRTF',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 12 }] },
      { id: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 2 }] },
      { id: 'P4', arrivalTime: 3, bursts: [{ type: 'CPU', duration: 4 }] },
      { id: 'P5', arrivalTime: 4, bursts: [{ type: 'CPU', duration: 2 }] },
    ],
  },
];

export default function ScenarioSelector() {
  const { setProcesses, setConfig, initializeSimulation } = useSimulationStore();

  const loadScenario = (scenario: Scenario) => {
    setProcesses(scenario.processes);
    setConfig({
      algorithm: scenario.algorithm,
      quantum: scenario.quantum,
      preemptive: scenario.preemptive,
    });
    initializeSimulation();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Example Scenarios
      </label>
      <div className="space-y-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.name}
            onClick={() => loadScenario(scenario)}
            className="w-full text-left p-3 bg-gray-50 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors border border-transparent"
          >
            <div className="font-medium text-gray-900 text-sm">{scenario.name}</div>
            <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
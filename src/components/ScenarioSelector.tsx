import { useSimulationStore } from '../application';
import { ProcessDefinition } from '../domain/types';

interface Scenario {
  name: string;
  description: string;
  processes: ProcessDefinition[];
  algorithm: 'FCFS' | 'SRTF' | 'RR';
  quantum?: number;
}

const SCENARIOS: Scenario[] = [
  {
    name: 'FCFS mit I/O',
    description: 'Prozesse mit CPU- und I/O-Bursts - P1 wird blockiert während P2 läuft',
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
    name: 'SRTF Präemption',
    description: 'Kürzerer Prozess unterbricht längeren - gut sichtbar in der Timeline',
    algorithm: 'SRTF',
    processes: [
      { id: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 8 }] },
      { id: 'P2', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 3 }] },
      { id: 'P3', arrivalTime: 4, bursts: [{ type: 'CPU', duration: 2 }] },
    ],
  },
  {
    name: 'Round Robin',
    description: 'Prozesse mit leicht versetzten Ankunftszeiten - Time-Sharing (Quantum = 3)',
    algorithm: 'RR',
    quantum: 3,
    processes: [
      {
        id: 'P1',
        arrivalTime: 0,
        bursts: [
          { type: 'CPU', duration: 4 },
          { type: 'IO', duration: 3 },
          { type: 'CPU', duration: 3 },
        ],
      },
      {
        id: 'P2',
        arrivalTime: 1,
        bursts: [
          { type: 'CPU', duration: 3 },
          { type: 'IO', duration: 2 },
          { type: 'CPU', duration: 2 },
        ],
      },
      {
        id: 'P3',
        arrivalTime: 2,
        bursts: [{ type: 'CPU', duration: 4 }],
      },
    ],
  },
  {
    name: 'I/O Bound Beispiel',
    description: 'Prozess wechselt mehrfach zwischen CPU und I/O',
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
    name: 'Komplexes SRTF',
    description: 'Viele kurze Prozesse unterbrechen den langen - zeigt Stärke von SRTF',
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
    });
    initializeSimulation();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Beispiel-Szenarien
      </label>
      <div className="space-y-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.name}
            onClick={() => loadScenario(scenario)}
            className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="font-medium text-gray-900 text-sm">{scenario.name}</div>
            <div className="text-xs text-gray-500">{scenario.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

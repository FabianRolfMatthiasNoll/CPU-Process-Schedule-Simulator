import { useState } from 'react';
import { useSimulationStore } from './application';
import { SimulationConfig } from './domain/types';
import GanttChart from './components/GanttChart';
import ReadyQueue from './components/ReadyQueue';
import BlockedQueue from './components/BlockedQueue';
import RunningProcess from './components/RunningProcess';
import MetricsDisplay from './components/MetricsDisplay';
import ControlPanel from './components/ControlPanel';
import ProcessForm from './components/ProcessForm';
import PracticeMode from './components/PracticeMode';
import ScenarioSelector from './components/ScenarioSelector';

function App() {
  const [showForm, setShowForm] = useState(false);
  const {
    mode,
    currentEventIndex,
    events,
  } = useSimulationStore();

  const currentEvent = currentEventIndex >= 0 ? events[currentEventIndex] : null;
  const { config, setConfig } = useSimulationStore();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="w-full px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            CPU-Scheduling Simulator & Trainer
          </h1>
          <p className="text-sm text-gray-500">
            Visualisierung und Übung von CPU-Scheduling-Algorithmen
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row gap-4 p-4">
          {/* Left Column - Configuration */}
          <div className="lg:w-80 flex-shrink-0 space-y-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Konfiguration</h2>
              <ScenarioSelector />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algorithmus
                </label>
                <select
                  value={config.algorithm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      algorithm: e.target.value as SimulationConfig['algorithm'],
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="FCFS">FCFS (First Come First Serve)</option>
                  <option value="SRTF">SRTF (Shortest Remaining Time First)</option>
                  <option value="RR">Round Robin</option>
                </select>
              </div>
              {config.algorithm === 'RR' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantum
                  </label>
                  <input
                    type="number"
                    value={config.quantum || 4}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        quantum: parseInt(e.target.value) || 4,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    min="1"
                  />
                </div>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {showForm ? 'Formular verstecken' : 'Prozesse definieren'}
              </button>
              {showForm && <ProcessForm />}
            </div>

            <ControlPanel />
          </div>

          {/* Right Column - Visualization */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Status Bar */}
            <div className="bg-white rounded-lg shadow p-4 flex-shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-sm text-gray-500">Aktuelle Zeit:</span>
                  <span className="ml-2 text-xl font-bold text-gray-900">
                    {currentEvent?.time ?? 0}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Modus:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {mode === 'auto' && 'Auto'}
                    {mode === 'step' && 'Schritt'}
                    {mode === 'practice' && 'Übung'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Event:</span>
                  <span className="ml-2 text-sm font-mono text-gray-700">
                    {currentEvent?.type ?? '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Process State Visualization */}
            <div className="grid grid-cols-3 gap-4 flex-shrink-0">
              <RunningProcess />
              <ReadyQueue />
              <BlockedQueue />
            </div>

            {/* Gantt Chart - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <GanttChart />
            </div>

            {/* Metrics */}
            <MetricsDisplay />

            {/* Practice Mode */}
            {mode === 'practice' && <PracticeMode />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

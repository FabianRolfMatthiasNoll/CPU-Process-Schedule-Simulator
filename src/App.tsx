import { useState } from 'react';
import { useSimulationStore, SimulationMode } from './application';
import { SimulationConfig } from './domain/types';
import GanttChart from './components/GanttChart';
import ReadyQueue from './components/ReadyQueue';
import BlockedQueue from './components/BlockedQueue';
import RunningProcess from './components/RunningProcess';
import MetricsDisplay from './components/MetricsDisplay';
import ArrivalsQueue from './components/ArrivalsQueue';
import ScenarioSelector from './components/ScenarioSelector';
import GanttDrawer from './components/GanttDrawer';

function App() {
  const [showExamples, setShowExamples] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulate' | 'draw'>('simulate');
  const {
    mode,
    setMode,
    step,
    run,
    pause,
    reset,
    isRunning,
    setSpeed,
    speed,
    currentTime,
    initializeSimulation,
    processes,
    snapshots,
    currentSnapshotIndex,
  } = useSimulationStore();

  const { config, setConfig } = useSimulationStore();

  const canStart = processes.length > 0;
  const atStart = currentTime <= 0;
  const canStep = snapshots.length > 0 && currentSnapshotIndex < snapshots.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="w-full px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">
            CPU Scheduling Simulator
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Fixed Width */}
        <div className="w-80 flex-shrink-0 bg-white border-r overflow-y-auto p-4 space-y-3">
          {/* Algorithm Selection */}
          <div className="bg-gray-50 rounded-lg p-3">
            <select
              value={config.algorithm}
              onChange={(e) =>
                setConfig({
                  ...config,
                  algorithm: e.target.value as SimulationConfig['algorithm'],
                })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm mb-2"
            >
              <option value="FCFS">FCFS (First Come First Serve)</option>
              <option value="SJF">SJF (Shortest Job First)</option>
              <option value="LJF">LJF (Longest Job First)</option>
              <option value="SRTF">SRTF (Shortest Remaining Time First)</option>
              <option value="LRTF">LRTF (Longest Remaining Time First)</option>
              <option value="RR">Round Robin</option>
              <option value="Priority">Priority Scheduling</option>
              <option value="HRRN">HRRN (Highest Response Ratio Next)</option>
            </select>

            {config.algorithm === 'RR' && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1.5 border text-sm"
                  min="1"
                />
              </div>
            )}

            {config.algorithm === 'Priority' && (
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.preemptive ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        preemptive: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Preemptive</span>
                </label>
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mode
            </label>
            <div className="flex gap-1">
              {(['step', 'auto'] as SimulationMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {m === 'step' && 'Step'}
                  {m === 'auto' && 'Auto'}
                </button>
              ))}
            </div>

            {mode === 'auto' && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Speed: {speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex gap-1">
              <button
                onClick={reset}
                disabled={atStart}
                className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Reset"
              >
                ⏮
              </button>
              <button
                onClick={() => step()}
                disabled={!canStep || mode === 'auto'}
                className="px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Next Step"
              >
                ▶▶
              </button>
              {mode === 'auto' ? (
                <button
                  onClick={isRunning ? pause : run}
                  className={`px-2 py-1.5 rounded text-sm ${
                    isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                  title={isRunning ? 'Pause' : 'Play'}
                >
                  {isRunning ? '⏸' : '▶'}
                </button>
              ) : null}
              <button
                onClick={initializeSimulation}
                disabled={!canStart}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Start
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowExamples(!showExamples);
                if (!showExamples) setActiveTab('simulate');
              }}
              className={`flex-1 px-3 py-1.5 rounded text-sm ${
                showExamples ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Examples
            </button>
          </div>

          {/* Collapsible Examples Panel */}
          {showExamples && (
            <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
              <ScenarioSelector />
            </div>
          )}

          {/* Metrics */}
          <MetricsDisplay />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Status Bar */}
          <div className="bg-white rounded-lg shadow p-3 flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-sm text-gray-500">Current Time:</span>
                <span className="ml-2 text-lg font-bold text-gray-900">
                  {currentTime}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Tab Toggle */}
                <div className="flex rounded-lg overflow-hidden border">
                  <button
                    onClick={() => setActiveTab('simulate')}
                    className={`px-4 py-1.5 text-sm font-medium ${
                      activeTab === 'simulate'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Simulate
                  </button>
                  <button
                    onClick={() => setActiveTab('draw')}
                    className={`px-4 py-1.5 text-sm font-medium ${
                      activeTab === 'draw'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draw
                  </button>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Mode:</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    {mode === 'auto' && 'Auto'}
                    {mode === 'step' && 'Step'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on tab */}
          {activeTab === 'simulate' ? (
            <>
              {/* Process State Visualization */}
              <div className="grid grid-cols-4 gap-4 flex-shrink-0 mt-4">
                <ArrivalsQueue />
                <RunningProcess />
                <ReadyQueue />
                <BlockedQueue />
              </div>

              {/* Gantt Chart - Scrollable */}
              <div className="flex-1 overflow-hidden mt-4">
                <GanttChart />
              </div>
            </>
          ) : (
            /* Draw Mode */
            <div className="flex-1 overflow-hidden mt-4">
              <GanttDrawer />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
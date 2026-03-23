import { useSimulationStore, SimulationMode } from '../application';

export default function ControlPanel() {
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

  const canStart = processes.length > 0;
  const atStart = currentTime <= 0;
  // Stepping is possible when we have snapshots and haven't reached the end
  const canStep = snapshots.length > 0 && currentSnapshotIndex < snapshots.length - 1;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold text-gray-900 mb-4">Steuerung</h2>

      {/* Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modus
        </label>
        <div className="flex gap-2">
          {(['step', 'auto', 'practice'] as SimulationMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m === 'step' && 'Schritt'}
              {m === 'auto' && 'Auto'}
              {m === 'practice' && 'Übung'}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control (for Auto mode) */}
      {mode === 'auto' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geschwindigkeit: {speed}x
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

      {/* Playback Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={reset}
          disabled={atStart}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zurücksetzen"
        >
          ⏮
        </button>
        <button
          onClick={() => step()}
          disabled={!canStep || mode === 'auto'}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Nächster Schritt"
        >
          ▶▶
        </button>
        {mode === 'auto' ? (
          <button
            onClick={isRunning ? pause : run}
            className={`px-3 py-2 rounded text-white ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            title={isRunning ? 'Pause' : 'Abspielen'}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
        ) : null}
      </div>

      {/* Initialize Button */}
      <button
        onClick={initializeSimulation}
        disabled={!canStart}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Simulation starten
      </button>

      {/* Progress */}
      {currentTime > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Zeit</span>
            <span>{currentTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}

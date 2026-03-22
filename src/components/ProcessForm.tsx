import { useState } from 'react';
import { useSimulationStore } from '../application';
import { ProcessDefinition, Burst } from '../domain/types';

export default function ProcessForm() {
  const { processes, setProcesses } = useSimulationStore();
  const [processId, setProcessId] = useState('');
  const [arrivalTime, setArrivalTime] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([{ type: 'CPU', duration: 5 }]);
  const [error, setError] = useState<string | null>(null);

  const addBurst = () => {
    const lastBurst = bursts[bursts.length - 1];
    if (lastBurst.type === 'CPU') {
      setBursts([...bursts, { type: 'IO', duration: 3 }]);
    } else {
      setBursts([...bursts, { type: 'CPU', duration: 5 }]);
    }
  };

  const updateBurst = (index: number, duration: number) => {
    const newBursts = [...bursts];
    newBursts[index] = { ...newBursts[index], duration };
    setBursts(newBursts);
  };

  const removeBurst = (index: number) => {
    if (bursts.length <= 1) return;
    setBursts(bursts.filter((_, i) => i !== index));
  };

  const handleAddProcess = () => {
    setError(null);

    // Validation
    if (!processId.trim()) {
      setError('Prozess-ID ist erforderlich');
      return;
    }
    if (processes.some((p) => p.id === processId)) {
      setError('Prozess-ID bereits vorhanden');
      return;
    }
    if (arrivalTime < 0) {
      setError('Arrival Time darf nicht negativ sein');
      return;
    }
    if (bursts.some((b) => b.duration <= 0)) {
      setError('Burst-Dauer muss positiv sein');
      return;
    }
    if (!bursts.some((b) => b.type === 'CPU')) {
      setError('Mindestens ein CPU-Burst erforderlich');
      return;
    }

    const newProcess: ProcessDefinition = {
      id: processId.trim(),
      arrivalTime,
      bursts: [...bursts],
    };

    setProcesses([...processes, newProcess]);
    setProcessId('');
    setArrivalTime(0);
    setBursts([{ type: 'CPU', duration: 5 }]);
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-medium text-gray-800 mb-3">Neuen Prozess hinzufügen</h4>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Prozess-ID</label>
            <input
              type="text"
              value={processId}
              onChange={(e) => setProcessId(e.target.value.toUpperCase())}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
              placeholder="z.B. P1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Arrival Time</label>
            <input
              type="number"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(parseInt(e.target.value) || 0)}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Bursts</label>
          <div className="space-y-2">
            {bursts.map((burst, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    burst.type === 'CPU'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {burst.type}
                </span>
                <input
                  type="number"
                  value={burst.duration}
                  onChange={(e) => updateBurst(index, parseInt(e.target.value) || 0)}
                  className="w-20 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                  min="1"
                />
                <span className="text-xs text-gray-500">Zeiteinheiten</span>
                {bursts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBurst(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addBurst}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Burst hinzufügen
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddProcess}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          Prozess hinzufügen
        </button>
      </div>

      {/* Existing Processes */}
      {processes.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Definierte Prozesse ({processes.length})
          </h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {processes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
              >
                <div>
                  <span className="font-medium">{p.id}</span>
                  <span className="text-gray-500 ml-2">AT: {p.arrivalTime}</span>
                  <span className="text-gray-500 ml-2">
                    Bursts: {p.bursts.map((b) => `${b.type[0]}:${b.duration}`).join(', ')}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveProcess(p.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

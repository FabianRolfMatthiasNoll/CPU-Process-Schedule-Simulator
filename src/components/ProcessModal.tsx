import { useState } from 'react';
import { useSimulationStore } from '../application';
import { ProcessDefinition, Burst } from '../domain/types';
import Modal from './Modal';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProcessModal({ isOpen, onClose }: ProcessModalProps) {
  const { processes, setProcesses } = useSimulationStore();
  const [processId, setProcessId] = useState('');
  const [arrivalTime, setArrivalTime] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([{ type: 'CPU', duration: 5 }]);
  const [error, setError] = useState<string | null>(null);

  const generateRandomId = () => {
    const existingIds = processes.map(p => parseInt(p.id.replace(/\D/g, '')) || 0);
    const maxId = Math.max(0, ...existingIds);
    return `P${maxId + 1}`;
  };

  const randomizeProcess = () => {
    const id = generateRandomId();
    const numBursts = Math.floor(Math.random() * 3) + 1; // 1-3 bursts
    const newBursts: Burst[] = [];

    for (let i = 0; i < numBursts; i++) {
      if (i === 0 || Math.random() > 0.3) {
        // CPU burst
        newBursts.push({
          type: 'CPU',
          duration: Math.floor(Math.random() * 8) + 2, // 2-9
        });
      } else {
        // IO burst
        newBursts.push({
          type: 'IO',
          duration: Math.floor(Math.random() * 6) + 2, // 2-7
        });
      }
    }

    // Ensure it ends with CPU
    if (newBursts[newBursts.length - 1].type === 'IO') {
      newBursts[newBursts.length - 1] = {
        type: 'CPU',
        duration: Math.floor(Math.random() * 8) + 2,
      };
    }

    setProcessId(id);
    setArrivalTime(Math.floor(Math.random() * 5)); // 0-4
    setBursts(newBursts);
    setError(null);
  };

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

    if (!processId.trim()) {
      setError('Process ID is required');
      return;
    }
    if (processes.some((p) => p.id === processId)) {
      setError('Process ID already exists');
      return;
    }
    if (arrivalTime < 0) {
      setError('Arrival Time cannot be negative');
      return;
    }
    if (bursts.some((b) => b.duration <= 0)) {
      setError('Burst duration must be positive');
      return;
    }
    if (!bursts.some((b) => b.type === 'CPU')) {
      setError('At least one CPU burst is required');
      return;
    }

    const newProcess: ProcessDefinition = {
      id: processId.trim(),
      arrivalTime,
      bursts: [...bursts],
    };

    setProcesses([...processes, newProcess]);
    onClose();
  };

  const handleRemoveProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Define Processes">
      <div className="space-y-4">
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={randomizeProcess}
            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm font-medium"
          >
            Generate Random
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Process ID</label>
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
                <span className="text-xs text-gray-500">time units</span>
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
            + Add Burst
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddProcess}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          Add Process
        </button>

        {/* Existing Processes */}
        {processes.length > 0 && (
          <div className="pt-4 border-t">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Defined Processes ({processes.length})
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
    </Modal>
  );
}

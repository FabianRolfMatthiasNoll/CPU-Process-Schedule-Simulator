import { useState } from 'react';
import { useSimulationStore } from '../application';

export default function PracticeMode() {
  const { readyQueue } = useSimulationStore();
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Practice Mode</h3>

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Your task:</strong> Choose the correct process from the Ready Queue
          for the next scheduling decision.
        </p>
      </div>

      {/* Ready Queue Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select the next process:
        </label>
        <div className="flex flex-wrap gap-2">
          {readyQueue.map((processId) => (
            <button
              key={processId}
              onClick={() => setSelectedProcess(processId)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedProcess === processId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {processId}
            </button>
          ))}
        </div>
        {readyQueue.length === 0 && (
          <div className="text-sm text-gray-400 italic">
            No processes in the Ready Queue
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 italic">
        Practice mode - full implementation coming soon.
      </div>
    </div>
  );
}
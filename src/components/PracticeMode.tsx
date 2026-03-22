import { useState } from 'react';
import { useSimulationStore } from '../application';

export default function PracticeMode() {
  const {
    getReadyQueue,
    submitUserDecision,
    practiceError,
    practiceCorrectUpTo,
    expectedDecisions,
    userDecisions,
    events,
    currentEventIndex,
    showReferenceSolution,
    step,
  } = useSimulationStore();

  const readyQueue = getReadyQueue();
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  // Get the current decision index based on dispatched events
  let decisionIndex = 0;
  for (let i = 0; i <= currentEventIndex; i++) {
    if (events[i]?.type === 'PROCESS_DISPATCHED') {
      decisionIndex++;
    }
  }

  const handleSubmit = () => {
    if (!selectedProcess) return;
    submitUserDecision(selectedProcess);
    setSelectedProcess(null);
    step();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Übungsmodus</h3>

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Ihre Aufgabe:</strong> Wählen Sie bei jeder Scheduling-Entscheidung den
          richtigen Prozess aus der Ready Queue aus.
        </p>
      </div>

      {/* Current Decision Point */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Entscheidung #{decisionIndex + 1}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          {practiceCorrectUpTo >= 0 && (
            <span className="text-green-600">
              Korrekt bis Schritt {practiceCorrectUpTo + 1}
            </span>
          )}
        </div>
      </div>

      {/* Ready Queue Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wählen Sie den nächsten Prozess:
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
            Keine Prozesse in der Ready Queue
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedProcess || readyQueue.length === 0}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
      >
        Entscheidung bestätigen
      </button>

      {/* Error Message */}
      {practiceError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">{practiceError}</p>
        </div>
      )}

      {/* History */}
      {userDecisions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ihre Entscheidungen:</h4>
          <div className="space-y-1">
            {userDecisions.map((decision, index) => {
              const isCorrect = expectedDecisions[index] === decision;
              return (
                <div
                  key={index}
                  className={`text-sm ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Schritt {index + 1}: {decision}{' '}
                  {!isCorrect && (
                    <span className="text-gray-500">
                      (richtig wäre: {expectedDecisions[index]})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show Solution */}
      {practiceError && (
        <button
          onClick={showReferenceSolution}
          className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
        >
          Referenzlösung anzeigen
        </button>
      )}
    </div>
  );
}

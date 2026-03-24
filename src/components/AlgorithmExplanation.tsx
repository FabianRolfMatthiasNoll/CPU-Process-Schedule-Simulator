import { useSimulationStore } from '../application';

export default function AlgorithmExplanation() {
  const { snapshots, currentSnapshotIndex, config } = useSimulationStore();

  const snapshot = snapshots[currentSnapshotIndex];
  const decision = snapshot?.schedulingDecision;

  if (!snapshot) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">
        Scheduling Decision
      </h3>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-500">Algorithm: </span>
          <span className="font-medium">{config.algorithm}</span>
          {config.algorithm === 'Priority' && (
            <span className="ml-1 text-xs text-gray-400">
              ({(config.preemptive ?? true) ? 'preemptive' : 'non-preemptive'})
            </span>
          )}
          {config.algorithm === 'RR' && (
            <span className="ml-1 text-xs text-gray-400">
              (Quantum: {config.quantum ?? 4})
            </span>
          )}
        </div>

        {decision ? (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              {decision.reason}
            </div>
            {decision.alternatives && decision.alternatives.length > 0 && (
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Alternatives: </span>
                <span>{decision.alternatives.join(', ')}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 italic">
              No decision yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
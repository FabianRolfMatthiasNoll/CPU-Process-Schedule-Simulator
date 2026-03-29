import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadyQueue() {
  const { readyQueue, runningProcessId, snapshots, currentSnapshotIndex, processDefinitions, config } = useSimulationStore();
  const showPriority = config.algorithm === 'Priority';
  const showHRRN = config.algorithm === 'HRRN';

  // Get priority for a process
  const getPriority = (processId: string): number | null => {
    const procDef = processDefinitions.find(p => p.id === processId);
    return procDef?.priority ?? null;
  };

  // Calculate total remaining CPU time for a process
  const getRemainingCpu = (processId: string): number | null => {
    if (currentSnapshotIndex < 0) return null;
    const snapshot = snapshots[currentSnapshotIndex];
    const procDef = processDefinitions.find(p => p.id === processId);
    const procSnap = snapshot?.processes.get(processId);
    if (!procDef || !procSnap) return null;

    // Sum remaining of current burst + all future CPU bursts
    let total = procSnap.remainingBurstTime;
    for (let i = procSnap.currentBurstIndex + 1; i < procDef.bursts.length; i++) {
      if (procDef.bursts[i].type === 'CPU') {
        total += procDef.bursts[i].duration;
      }
    }
    return total;
  };

  // Get only current CPU burst duration (for HRRN)
  const getCurrentBurstDuration = (processId: string): number | null => {
    if (currentSnapshotIndex < 0) return null;
    const snapshot = snapshots[currentSnapshotIndex];
    const procDef = processDefinitions.find(p => p.id === processId);
    const procSnap = snapshot?.processes.get(processId);
    if (!procDef || !procSnap) return null;

    const currentBurst = procDef.bursts[procSnap.currentBurstIndex];
    if (!currentBurst || currentBurst.type !== 'CPU') return null;
    return currentBurst.duration;
  };

  // Calculate Response Ratio for HRRN (using only current burst)
  const getResponseRatio = (processId: string): number | null => {
    if (currentSnapshotIndex < 0) return null;
    const snapshot = snapshots[currentSnapshotIndex];
    const procSnap = snapshot?.processes.get(processId);
    if (!procSnap) return null;

    // HRRN uses only current CPU burst, not total remaining
    const burstTime = getCurrentBurstDuration(processId);
    if (burstTime === null || burstTime === 0) return null;

    const waitingTime = procSnap.waitingTime;
    return (waitingTime + burstTime) / burstTime;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">
        Ready Queue
        {showHRRN && <span className="ml-2 text-xs font-normal text-gray-500">(HRRN: RR shown)</span>}
      </h3>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 min-h-[80px]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Running process on the LEFT (next to be dispatched) */}
          {runningProcessId && (
            <div className="flex items-center gap-1">
              <div className="bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-bold shadow flex flex-col items-center">
                <span className="flex items-center gap-1">
                  {runningProcessId}
                  {showPriority && getPriority(runningProcessId) !== null && (
                    <span className="bg-blue-700 text-xs px-1 rounded">{String.fromCharCode(64 + getPriority(runningProcessId)!)}</span>
                  )}
                </span>
                <span className="text-xs opacity-80">{getRemainingCpu(runningProcessId)}</span>
              </div>
              <span className="text-gray-400 text-xs">→</span>
            </div>
          )}

          {/* Ready queue - items flow left to right */}
          <AnimatePresence mode="popLayout">
            {readyQueue.length === 0 && !runningProcessId ? (
              <div className="text-sm text-gray-400 italic">Empty</div>
            ) : (
              readyQueue.map((processId, index) => (
                <motion.div
                  key={processId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-1"
                >
                  <div className={`rounded px-3 py-2 text-sm font-medium flex flex-col items-center ${
                    index === 0 ? 'bg-green-200 border-2 border-green-500 text-green-900' : 'bg-green-100 border border-green-300 text-green-800'
                  }`}>
                    <span className="font-bold flex items-center gap-1">
                      {processId}
                      {showPriority && getPriority(processId) !== null && (
                        <span className="bg-green-600 text-white text-xs px-1 rounded">{String.fromCharCode(64 + getPriority(processId)!)}</span>
                      )}
                    </span>
                    {showHRRN ? (
                      <span className="text-xs opacity-70">RR: {getResponseRatio(processId)?.toFixed(2)}</span>
                    ) : (
                      <span className="text-xs opacity-70">{getRemainingCpu(processId)}</span>
                    )}
                  </div>
                  {index < readyQueue.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {readyQueue.length === 0 && runningProcessId && (
            <div className="text-xs text-gray-400 italic ml-2">waiting...</div>
          )}
        </div>
      </div>

      {/* HRRN Formula explanation */}
      {showHRRN && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <span className="font-medium text-yellow-800">HRRN Formula:</span>
          <span className="text-yellow-700 ml-1">RR = (Wait + Burst) / Burst</span>
        </div>
      )}

      {/* Flow indicator */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>← Running</span>
        <span className="flex items-center gap-1">
          Next →
          {readyQueue.length > 0 && (
            <span className="bg-green-200 border border-green-500 text-green-900 rounded px-1 font-bold">
              {readyQueue[0]}
            </span>
          )}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {readyQueue.length} process{readyQueue.length !== 1 ? 'es' : ''} waiting
      </div>
    </div>
  );
}
import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function RunningProcess() {
  const { runningProcessId, snapshots, currentSnapshotIndex, processDefinitions, config } = useSimulationStore();
  const showHRRN = config.algorithm === 'HRRN';

  // Calculate total remaining CPU time for a process
  const getRemainingCpu = (processId: string): number | null => {
    if (currentSnapshotIndex < 0) return null;
    const snapshot = snapshots[currentSnapshotIndex];
    const procDef = processDefinitions.find(p => p.id === processId);
    const procSnap = snapshot?.processes.get(processId);
    if (!procDef || !procSnap) return null;

    let total = procSnap.remainingBurstTime;
    for (let i = procSnap.currentBurstIndex + 1; i < procDef.bursts.length; i++) {
      if (procDef.bursts[i].type === 'CPU') {
        total += procDef.bursts[i].duration;
      }
    }
    return total;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Running</h3>
      <div className="border-2 border-blue-300 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {runningProcessId ? (
            <motion.div
              key={runningProcessId}
              className="bg-blue-500 text-white rounded-lg px-4 py-3 text-lg font-bold shadow-lg text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div className="text-xl">{runningProcessId}</div>
              <div className="text-sm opacity-80">Rem: {getRemainingCpu(runningProcessId)}</div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Idle
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function RunningProcess() {
  const { runningProcessId, snapshots, currentSnapshotIndex } = useSimulationStore();

  // Get remaining CPU time for running process
  let remainingCpu = null;
  if (runningProcessId && currentSnapshotIndex >= 0) {
    const snapshot = snapshots[currentSnapshotIndex];
    const procSnap = snapshot?.processes.get(runningProcessId);
    if (procSnap) {
      // Calculate remaining CPU time from current burst + future bursts
      remainingCpu = procSnap.remainingBurstTime;
      for (let i = procSnap.currentBurstIndex + 1; i < snapshot.processes.get(runningProcessId)?.burstStartTime!; i++) {
        // This is a simplified version - we'd need access to the full burst info
      }
    }
  }

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
              {remainingCpu !== null && (
                <div className="text-sm opacity-80">Rem: {remainingCpu}</div>
              )}
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

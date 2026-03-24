import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArrivalsQueue() {
  const { currentTime, snapshots, currentSnapshotIndex, processDefinitions } = useSimulationStore();

  // Get processes that arrived at the current tick
  const arrivals: string[] = [];
  if (currentSnapshotIndex >= 0) {
    const snapshot = snapshots[currentSnapshotIndex];
    if (snapshot) {
      for (const id of snapshot.currentTickArrivals) {
        arrivals.push(id);
      }
    }
  }

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
      <h3 className="font-semibold text-gray-900 mb-3">Neu Angekommen</h3>
      <div className="border-2 border-dashed border-purple-200 rounded-lg p-3 min-h-[60px]">
        <AnimatePresence mode="popLayout">
          {arrivals.length === 0 ? (
            <div className="text-sm text-gray-400 italic">Keine Ankünfte</div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap gap-2"
              >
                {arrivals.map((processId) => (
                  <motion.div
                    key={processId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-purple-100 border-2 border-purple-400 text-purple-900 rounded-lg px-3 py-2 text-sm font-bold flex flex-col items-center"
                  >
                    <span>{processId}</span>
                    <span className="text-xs opacity-70">Rem: {getRemainingCpu(processId)}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Ankünfte bei t={currentTime}
      </div>
    </div>
  );
}

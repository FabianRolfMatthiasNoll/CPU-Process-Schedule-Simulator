import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockedQueue() {
  const { getBlockedQueue } = useSimulationStore();
  const blockedQueue = getBlockedQueue();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Blocked Queue (I/O)</h3>
      <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg p-2">
        <AnimatePresence mode="popLayout">
          {blockedQueue.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">
              Leer
            </div>
          ) : (
            blockedQueue.map((processId, index) => (
              <motion.div
                key={processId}
                className="bg-orange-100 border border-orange-300 rounded px-3 py-2 mb-1 text-sm font-medium text-orange-800"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                {processId}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {blockedQueue.length} Prozess{blockedQueue.length !== 1 ? 'e' : ''} in I/O
      </div>
    </div>
  );
}

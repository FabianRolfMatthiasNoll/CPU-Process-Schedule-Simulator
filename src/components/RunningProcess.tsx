import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function RunningProcess() {
  const { runningProcessId } = useSimulationStore();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Running</h3>
      <div className="border-2 border-blue-300 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {runningProcessId ? (
            <motion.div
              key={runningProcessId}
              className="bg-blue-500 text-white rounded-lg px-4 py-3 text-lg font-bold shadow-lg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {runningProcessId}
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

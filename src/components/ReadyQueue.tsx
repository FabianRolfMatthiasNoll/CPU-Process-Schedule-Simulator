import { useSimulationStore } from '../application';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadyQueue() {
  const { getRunningProcess, events, currentEventIndex } = useSimulationStore();
  const runningProcess = getRunningProcess();

  // Reconstruct the ready queue order by replaying events
  // This gives us the correct order at currentEventIndex
  const getQueueOrder = (): string[] => {
    const queue: string[] = [];

    for (let i = 0; i <= currentEventIndex; i++) {
      const event = events[i];

      if (event.type === 'PROCESS_ARRIVED') {
        // New process arrives - add to end of queue
        if (!queue.includes(event.processId)) {
          queue.push(event.processId);
        }
      } else if (event.type === 'PROCESS_DISPATCHED') {
        // Process was dispatched - remove from queue
        const idx = queue.indexOf(event.processId);
        if (idx >= 0) {
          queue.splice(idx, 1);
        }
      } else if (event.type === 'IO_BURST_COMPLETED') {
        // Process completed IO - add to end of queue
        if (!queue.includes(event.processId)) {
          queue.push(event.processId);
        }
      } else if (event.type === 'PROCESS_PREEMPTED') {
        // Process was preempted - it's already removed from running
        // But we need to add it back to the queue (at the end for RR)
        if (!queue.includes(event.processId)) {
          queue.push(event.processId);
        }
      }
    }

    return queue;
  };

  const queueOrder = getQueueOrder();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Ready Queue</h3>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 min-h-[80px]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Running process on the LEFT (next to be dispatched) */}
          {runningProcess && (
            <div className="flex items-center gap-1">
              <div className="bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-bold shadow">
                {runningProcess}
              </div>
              <span className="text-gray-400 text-xs">→</span>
            </div>
          )}

          {/* Ready queue - items flow left to right */}
          <AnimatePresence mode="popLayout">
            {queueOrder.length === 0 && !runningProcess ? (
              <div className="text-sm text-gray-400 italic">Leer</div>
            ) : (
              queueOrder.map((processId, index) => (
                <motion.div
                  key={processId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-1"
                >
                  <div className={`rounded px-3 py-2 text-sm font-medium ${
                    index === 0 ? 'bg-green-200 border-2 border-green-500 text-green-900' : 'bg-green-100 border border-green-300 text-green-800'
                  }`}>
                    {processId}
                  </div>
                  {index < queueOrder.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {queueOrder.length === 0 && runningProcess && (
            <div className="text-xs text-gray-400 italic ml-2">warten...</div>
          )}
        </div>
      </div>

      {/* Flow indicator */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>← Läuft</span>
        <span className="flex items-center gap-1">
          Nächster →
          {queueOrder.length > 0 && (
            <span className="bg-green-200 border border-green-500 text-green-900 rounded px-1 font-bold">
              {queueOrder[0]}
            </span>
          )}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {queueOrder.length} Prozess{queueOrder.length !== 1 ? 'e' : ''} wartend
      </div>
    </div>
  );
}

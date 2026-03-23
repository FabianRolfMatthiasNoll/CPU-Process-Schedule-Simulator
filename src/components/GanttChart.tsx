import { useSimulationStore } from '../application';
import { motion } from 'framer-motion';
import { GanttEntry } from '../domain/types';

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-teal-500',
];

const IO_COLOR = 'bg-orange-400';

function getProcessColor(processId: string): string {
  const hash = processId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export default function GanttChart() {
  const {
    ganttEntries,
    currentTime,
    runningProcessId,
    processDefinitions,
    readyQueue,
    blockedQueue,
  } = useSimulationStore();

  // Get process IDs from definitions
  const processIds = processDefinitions.map((p) => p.id);

  // Calculate timeline bounds
  const ganttMaxTime = ganttEntries.length > 0 ? Math.max(...ganttEntries.map((e: GanttEntry) => e.endTime)) : 10;
  const processMaxTime = processDefinitions.length > 0
    ? Math.max(...processDefinitions.map(p => p.arrivalTime + p.bursts.reduce((sum: number, b: { duration: number }) => sum + b.duration, 0)))
    : 10;
  const maxTime = Math.max(ganttMaxTime, processMaxTime, currentTime + 3, 10);

  const pixelsPerUnit = 60;
  const rowHeight = 40;
  const labelWidth = 50;

  // Get current snapshot to find IO start times
  const { snapshots, currentSnapshotIndex } = useSimulationStore.getState();
  const currentSnapshot = snapshots[currentSnapshotIndex] || null;
  let currentGanttStart: number | null = null;
  let ioSnapshotStarts = new Map<string, number>(); // processId -> IO start time
  if (currentSnapshot) {
    currentGanttStart = currentSnapshot.currentGanttStart;
    ioSnapshotStarts = currentSnapshot.ioSnapshotStarts;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full overflow-hidden">
      {/* Scheduled Execution View */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Geplante Ausführung (bis t={currentTime})
        </h3>
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${labelWidth + maxTime * pixelsPerUnit + 40}px` }}>
            {/* Timeline header */}
            <div className="flex" style={{ marginLeft: `${labelWidth}px` }}>
              {Array.from({ length: maxTime + 1 }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-500 text-center flex-shrink-0"
                  style={{ width: `${pixelsPerUnit}px` }}
                >
                  {i}
                </div>
              ))}
            </div>

            {/* Time axis line */}
            <div className="flex" style={{ marginLeft: `${labelWidth}px`, height: '2px', backgroundColor: '#d1d5db' }}>
              {Array.from({ length: maxTime }, (_, i) => (
                <div key={i} className="flex-shrink-0" style={{ width: `${pixelsPerUnit}px` }} />
              ))}
            </div>

            {/* Process rows */}
            <div className="space-y-1">
              {processIds.map((processId) => {
                // Completed blocks for this process (already in ganttEntries)
                const completedBlocks = ganttEntries.filter((e: GanttEntry) => e.processId === processId);
                const isRunning = runningProcessId === processId;
                const isBlocked = blockedQueue.includes(processId);

                return (
                  <div key={`sched-${processId}`} className="flex items-center" style={{ height: `${rowHeight}px` }}>
                    {/* Process label */}
                    <div
                      className="flex items-center justify-end pr-2 text-sm font-medium text-gray-700 flex-shrink-0"
                      style={{ width: `${labelWidth}px` }}
                    >
                      <div className={`w-3 h-3 rounded mr-1 ${getProcessColor(processId)}`} />
                      {processId}
                    </div>

                    {/* Timeline area */}
                    <div className="relative flex-1" style={{ height: `${rowHeight - 8}px` }}>
                      {/* Grid lines */}
                      {Array.from({ length: maxTime + 1 }, (_, i) => (
                        <div
                          key={`grid-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-gray-200 z-0"
                          style={{ left: `${i * pixelsPerUnit}px` }}
                        />
                      ))}

                      {/* Current time marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                        style={{ left: `${currentTime * pixelsPerUnit}px` }}
                      />

                      {/* Completed blocks (CPU and IO) */}
                      {completedBlocks.map((block: GanttEntry, idx: number) => (
                        <motion.div
                          key={`block-${processId}-${idx}`}
                          className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-xs font-medium z-10 ${
                            block.type === 'IO' ? IO_COLOR : getProcessColor(processId)
                          }`}
                          style={{
                            left: `${block.startTime * pixelsPerUnit}px`,
                            width: `${(block.endTime - block.startTime) * pixelsPerUnit}px`,
                          }}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                        >
                          <span className="truncate px-1">
                            {block.type === 'IO' ? 'IO' : `${block.startTime}-${block.endTime}`}
                          </span>
                        </motion.div>
                      ))}

                      {/* Currently running block - show executed portion from currentGanttStart to currentTime */}
                      {isRunning && currentGanttStart !== null && (
                        <motion.div
                          key={`running-${processId}`}
                          className={`absolute top-1 bottom-1 ${getProcessColor(processId)} rounded flex items-center justify-center text-white text-xs font-medium z-20 border-2 border-yellow-300`}
                          style={{
                            left: `${currentGanttStart * pixelsPerUnit}px`,
                            width: `${(currentTime - currentGanttStart) * pixelsPerUnit}px`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="truncate px-1 font-bold">RUN</span>
                        </motion.div>
                      )}

                      {/* Blocked/IO block - show executed portion from ioSnapshotStart to currentTime */}
                      {isBlocked && ioSnapshotStarts.has(processId) && (
                        <motion.div
                          key={`blocked-${processId}`}
                          className={`absolute top-1 bottom-1 ${IO_COLOR} rounded flex items-center justify-center text-white text-xs font-medium z-10 opacity-70`}
                          style={{
                            left: `${ioSnapshotStarts.get(processId)! * pixelsPerUnit}px`,
                            width: `${(currentTime - ioSnapshotStarts.get(processId)!) * pixelsPerUnit}px`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                        >
                          <span className="truncate px-1">IO</span>
                        </motion.div>
                      )}

                      {/* Ready indicator */}
                      {readyQueue.includes(processId) && !isRunning && (
                        <div
                          className="absolute top-1 bottom-1 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs z-5"
                          style={{
                            left: `${currentTime * pixelsPerUnit}px`,
                            width: `${pixelsPerUnit}px`,
                          }}
                        >
                          <span className="truncate px-1">RDY</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Initial Process View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2">Prozess-Struktur (Ungeplant)</h3>
        <p className="text-xs text-gray-500 mb-2">Zeigt alle Bursts der Prozesse wie sie ankommen</p>

        <div className="overflow-x-auto flex-1">
          <div style={{ minWidth: `${labelWidth + maxTime * pixelsPerUnit + 40}px` }}>
            {/* Timeline header */}
            <div className="flex" style={{ marginLeft: `${labelWidth}px` }}>
              {Array.from({ length: maxTime + 1 }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-500 text-center flex-shrink-0"
                  style={{ width: `${pixelsPerUnit}px` }}
                >
                  {i}
                </div>
              ))}
            </div>

            {/* Time axis line */}
            <div className="flex" style={{ marginLeft: `${labelWidth}px`, height: '2px', backgroundColor: '#d1d5db' }}>
              {Array.from({ length: maxTime }, (_, i) => (
                <div key={i} className="flex-shrink-0" style={{ width: `${pixelsPerUnit}px` }} />
              ))}
            </div>

            {/* Process rows */}
            <div className="space-y-1">
              {processDefinitions.map((proc) => {
                let time = proc.arrivalTime;
                const blocks: { start: number; end: number; type: string }[] = [];

                for (const burst of proc.bursts) {
                  blocks.push({
                    start: time,
                    end: time + burst.duration,
                    type: burst.type,
                  });
                  time += burst.duration;
                }

                return (
                  <div key={`unsched-${proc.id}`} className="flex items-center" style={{ height: `${rowHeight}px` }}>
                    <div
                      className="flex items-center justify-end pr-2 text-sm font-medium text-gray-700 flex-shrink-0"
                      style={{ width: `${labelWidth}px` }}
                    >
                      <div className={`w-3 h-3 rounded mr-1 ${getProcessColor(proc.id)}`} />
                      {proc.id}
                    </div>

                    <div className="relative flex-1" style={{ height: `${rowHeight - 8}px` }}>
                      {/* Grid lines */}
                      {Array.from({ length: maxTime + 1 }, (_, i) => (
                        <div
                          key={`grid-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-gray-200 z-0"
                          style={{ left: `${i * pixelsPerUnit}px` }}
                        />
                      ))}

                      {blocks.map((block, idx) => (
                        <div
                          key={`burst-${proc.id}-${idx}`}
                          className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-xs font-medium z-10 ${
                            block.type === 'CPU' ? getProcessColor(proc.id) : IO_COLOR
                          }`}
                          style={{
                            left: `${block.start * pixelsPerUnit}px`,
                            width: `${(block.end - block.start) * pixelsPerUnit}px`,
                          }}
                        >
                          <span className="truncate px-1">
                            {block.type === 'IO' ? 'IO' : block.end - block.start}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

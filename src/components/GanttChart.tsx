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

function getProcessColor(processId: string): string {
  const hash = processId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export default function GanttChart() {
  const { ganttEntries, processes, currentTime, runningProcessId, runningSince, ioBlocks, currentIoProcess, blockedQueue } = useSimulationStore();

  // Calculate timeline bounds
  const ganttMaxTime = ganttEntries.length > 0 ? Math.max(...ganttEntries.map(e => e.endTime)) : 10;
  const ioMaxTime = ioBlocks.length > 0 ? Math.max(...ioBlocks.map(e => e.endTime)) : 0;
  const processMaxTime = processes.length > 0
    ? Math.max(...processes.map(p => p.arrivalTime + p.bursts.reduce((sum, b) => sum + b.duration, 0)))
    : 10;
  const maxTime = Math.max(ganttMaxTime, ioMaxTime, processMaxTime, currentTime + 3, 10);

  const pixelsPerUnit = 60;
  const rowHeight = 40;
  const labelWidth = 50;

  const processIds = processes.map((p) => p.id);

  // Build CPU blocks from ganttEntries - show completed blocks
  const completedCpuBlocks = ganttEntries.filter((e: GanttEntry) => e.endTime <= currentTime);

  // Build IO blocks from ioBlocks - show completed blocks
  const completedIoBlocks = ioBlocks.filter((e) => e.endTime <= currentTime);

  // Current running block - use runningSince to know when current process started
  const currentRunningBlock = runningProcessId && runningSince !== null
    ? { processId: runningProcessId, startTime: runningSince }
    : null;

  console.log('[GanttChart] currentTime=', currentTime, 'ganttEntries=', ganttEntries, 'running=', runningProcessId, 'runningSince=', runningSince, 'ioBlocks=', ioBlocks, 'currentIo=', currentIoProcess, 'blocked=', blockedQueue);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full overflow-hidden">
      {/* Scheduled Execution View */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Geplante CPU-Ausführung (bis t={currentTime})
        </h3>
        <div className="overflow-x-auto">
          <div className="relative" style={{ minWidth: `${labelWidth + maxTime * pixelsPerUnit + 40}px` }}>
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
                // Completed CPU blocks for this process
                const cpuBlocks = completedCpuBlocks.filter(e => e.processId === processId);
                // Completed IO blocks for this process
                const iosBlocks = completedIoBlocks.filter(e => e.processId === processId);
                // Currently running block for this process
                const isRunning = runningProcessId === processId;
                // Currently in IO block
                const isInIo = currentIoProcess?.processId === processId;

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

                      {/* Completed CPU blocks */}
                      {cpuBlocks.map((block: GanttEntry, idx: number) => (
                        <motion.div
                          key={`cpu-${processId}-${idx}`}
                          className={`absolute top-1 bottom-1 ${getProcessColor(processId)} rounded flex items-center justify-center text-white text-xs font-medium z-10`}
                          style={{
                            left: `${block.startTime * pixelsPerUnit}px`,
                            width: `${(block.endTime - block.startTime) * pixelsPerUnit}px`,
                          }}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                        >
                          <span className="truncate px-1">{block.startTime}-{block.endTime}</span>
                        </motion.div>
                      ))}

                      {/* Completed IO blocks */}
                      {iosBlocks.map((block, idx) => (
                        <motion.div
                          key={`io-${processId}-${idx}`}
                          className="absolute top-1 bottom-1 rounded z-10"
                          style={{
                            left: `${block.startTime * pixelsPerUnit}px`,
                            width: `${(block.endTime - block.startTime) * pixelsPerUnit}px`,
                            backgroundColor: '#fed7aa',
                            border: '2px solid #f97316',
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(249,115,22,0.2) 4px, rgba(249,115,22,0.2) 8px)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-700 font-medium">IO</span>
                        </motion.div>
                      ))}

                      {/* Currently in IO block - only show if IO has actually started (width > 0) */}
                      {isInIo && currentIoProcess && currentTime >= currentIoProcess.startTime && (
                        <motion.div
                          key={`io-running-${processId}`}
                          className="absolute top-1 bottom-1 rounded z-10 opacity-70"
                          style={{
                            left: `${currentIoProcess.startTime * pixelsPerUnit}px`,
                            width: `${(currentTime - currentIoProcess.startTime) * pixelsPerUnit}px`,
                            backgroundColor: '#fed7aa',
                            border: '2px solid #f97316',
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(249,115,22,0.2) 4px, rgba(249,115,22,0.2) 8px)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-700 font-medium">IO</span>
                        </motion.div>
                      )}

                      {/* Currently running block */}
                      {isRunning && currentRunningBlock && (
                        <motion.div
                          key={`cpu-running-${processId}`}
                          className={`absolute top-1 bottom-1 ${getProcessColor(processId)} rounded flex items-center justify-center text-white text-xs font-medium z-10 opacity-70`}
                          style={{
                            left: `${currentRunningBlock.startTime * pixelsPerUnit}px`,
                            width: `${(currentTime - currentRunningBlock.startTime) * pixelsPerUnit}px`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                        >
                          <span className="truncate px-1">{currentRunningBlock.startTime}-{currentTime}</span>
                        </motion.div>
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
              {processIds.map((processId) => {
                const proc = processes.find(p => p.id === processId);
                if (!proc) return null;

                const blocks: { start: number; end: number; type: string }[] = [];
                let time = proc.arrivalTime;
                for (const burst of proc.bursts) {
                  blocks.push({ start: time, end: time + burst.duration, type: burst.type });
                  time += burst.duration;
                }

                return (
                  <div key={`init-${processId}`} className="flex items-center" style={{ height: `${rowHeight}px` }}>
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
                          key={`igrid-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-gray-200 z-0"
                          style={{ left: `${i * pixelsPerUnit}px` }}
                        />
                      ))}

                      {/* Arrival marker */}
                      {proc && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                          style={{ left: `${proc.arrivalTime * pixelsPerUnit}px` }}
                        />
                      )}

                      {/* Burst blocks */}
                      {blocks.map((block, idx) => (
                        <motion.div
                          key={`burst-${processId}-${idx}`}
                          className={`absolute top-1 bottom-1 rounded flex items-center justify-center text-white text-xs font-medium z-10 ${
                            block.type === 'CPU' ? getProcessColor(processId) : 'bg-orange-400'
                          }`}
                          style={{
                            left: `${block.start * pixelsPerUnit}px`,
                            width: `${(block.end - block.start) * pixelsPerUnit}px`,
                            opacity: 0.8,
                          }}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 0.8, scaleY: 1 }}
                        >
                          <span className="truncate px-1 text-[10px]">
                            {block.type === 'CPU' ? 'CPU' : 'IO'}:{block.end - block.start}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-sm text-gray-700">CPU-Burst</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span className="text-sm text-gray-700">I/O-Burst</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500" />
          <span className="text-sm text-gray-700">Aktuelle Zeit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-500" />
          <span className="text-sm text-gray-700">Ankunftszeit</span>
        </div>
      </div>
    </div>
  );
}
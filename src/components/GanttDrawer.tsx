import { useState } from 'react';
import { useSimulationStore } from '../application';
import { ProcessDefinition, Burst } from '../domain/types';

export default function GanttDrawer() {
  const { setProcesses, initializeSimulation } = useSimulationStore();
  const [processes, setLocalProcesses] = useState<Record<number, DrawnCell[]>>({});

  const MAX_TIME = 20;
  const MAX_PROCESSES = 6;
  const pixelsPerUnit = 60;
  const rowHeight = 40;
  const labelWidth = 50;

  type CellType = 'empty' | 'CPU' | 'IO';

  interface DrawnCell {
    t: number;
    type: 'CPU' | 'IO';
  }

  // Get grid representation for a row
  const getRowGrid = (cells: DrawnCell[]): CellType[] => {
    const grid: CellType[] = Array(MAX_TIME).fill('empty');
    for (const cell of cells) {
      if (cell.t >= 0 && cell.t < MAX_TIME) {
        grid[cell.t] = cell.type;
      }
    }
    return grid;
  };

  // Convert drawn cells to bursts
  const cellsToBursts = (cells: DrawnCell[]): Burst[] => {
    if (cells.length === 0) return [];

    // Sort by time
    const sorted = [...cells].sort((a, b) => a.t - b.t);
    const bursts: Burst[] = [];

    let currentType = sorted[0].type;
    let currentStart = sorted[0].t;
    let currentEnd = sorted[0].t + 1;

    for (let i = 1; i < sorted.length; i++) {
      const cell = sorted[i];
      if (cell.type === currentType && cell.t === currentEnd) {
        // Extend current burst
        currentEnd = cell.t + 1;
      } else {
        // Save current burst and start new one
        bursts.push({ type: currentType, duration: currentEnd - currentStart });
        currentType = cell.type;
        currentStart = cell.t;
        currentEnd = cell.t + 1;
      }
    }
    // Don't add trailing IO
    if (currentType === 'CPU') {
      bursts.push({ type: currentType, duration: currentEnd - currentStart });
    }
    return bursts;
  };

  const handleCellClick = (pIdx: number, tIdx: number) => {
    const newProcesses = { ...processes };
    const rowCells = [...(newProcesses[pIdx] || [])];

    // Check if this cell already exists
    const existingIdx = rowCells.findIndex(c => c.t === tIdx);

    if (existingIdx >= 0) {
      // Cycle: CPU -> IO -> remove
      const current = rowCells[existingIdx];
      if (current.type === 'CPU') {
        rowCells[existingIdx] = { t: tIdx, type: 'IO' };
      } else {
        rowCells.splice(existingIdx, 1);
      }
    } else {
      // Add new CPU cell
      rowCells.push({ t: tIdx, type: 'CPU' });
    }

    if (rowCells.length === 0) {
      delete newProcesses[pIdx];
    } else {
      newProcesses[pIdx] = rowCells;
    }

    setLocalProcesses(newProcesses);
  };

  const clearAll = () => {
    setLocalProcesses({});
  };

  const applyToSimulation = () => {
    const validProcesses: ProcessDefinition[] = [];
    const warnings: string[] = [];

    Object.entries(processes).forEach(([rowIdx, cells]) => {
      if (cells.length === 0) return;

      const bursts = cellsToBursts(cells);
      if (bursts.length === 0) return;

      const sorted = [...cells].sort((a, b) => a.t - b.t);

      // Check for gaps
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].t > sorted[i - 1].t + 1) {
          warnings.push(`Gap in P${parseInt(rowIdx) + 1} at t=${sorted[i - 1].t + 1}`);
        }
      }

      const proc: ProcessDefinition = {
        id: `P${parseInt(rowIdx) + 1}`,
        arrivalTime: sorted[0].t,
        bursts,
        priority: parseInt(rowIdx) + 1, // Default: P1=A(1), P2=B(2), etc.
      };
      validProcesses.push(proc);
    });

    if (warnings.length > 0) {
      alert('Warnings:\n' + warnings.join('\n'));
    }

    if (validProcesses.length === 0) {
      alert('No valid processes to simulate');
      return;
    }

    setProcesses(validProcesses);
    initializeSimulation();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Draw Process Schedule</h3>
        <div className="flex gap-2">
          <button
            onClick={clearAll}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={applyToSimulation}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Click: empty → CPU → IO → empty
      </p>

      {/* Legend */}
      <div className="flex gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
          <span>Empty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>CPU</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span>IO</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: `${labelWidth + MAX_TIME * pixelsPerUnit + 40}px` }}>
          {/* Time header */}
          <div className="flex" style={{ marginLeft: `${labelWidth}px` }}>
            {Array.from({ length: MAX_TIME }, (_, i) => (
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
            {Array.from({ length: MAX_TIME }, (_, i) => (
              <div key={i} className="flex-shrink-0" style={{ width: `${pixelsPerUnit}px` }} />
            ))}
          </div>

          {/* Process rows */}
          <div className="space-y-1">
            {Array.from({ length: MAX_PROCESSES }, (_, pIdx) => {
              const rowCells = processes[pIdx] || [];
              const grid = getRowGrid(rowCells);
              const processColor = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'][pIdx];

              return (
                <div key={pIdx} className="flex items-center" style={{ height: `${rowHeight}px` }}>
                  <div
                    className="flex items-center justify-end pr-2 text-sm font-medium text-gray-700 flex-shrink-0"
                    style={{ width: `${labelWidth}px` }}
                  >
                    <div className={`w-3 h-3 rounded mr-1 ${processColor}`} />
                    P{pIdx + 1}
                  </div>

                  <div className="relative flex-1" style={{ height: `${rowHeight - 8}px` }}>
                    {/* Grid lines */}
                    {Array.from({ length: MAX_TIME + 1 }, (_, i) => (
                      <div
                        key={`grid-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-gray-200 z-0"
                        style={{ left: `${i * pixelsPerUnit}px` }}
                      />
                    ))}

                    {/* Individual cells - clickable */}
                    {Array.from({ length: MAX_TIME }, (_, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => handleCellClick(pIdx, tIdx)}
                        className={`absolute top-0 bottom-0 z-10 transition-colors ${
                          grid[tIdx] === 'CPU'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : grid[tIdx] === 'IO'
                            ? 'bg-orange-400 hover:bg-orange-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={{
                          left: `${tIdx * pixelsPerUnit}px`,
                          width: `${pixelsPerUnit}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current process definitions */}
      {Object.keys(processes).length > 0 && (
        <div className="mt-4 pt-4 border-t flex-shrink-0">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Drawn Cells:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(processes)
              .filter(([, cells]) => cells.length > 0)
              .map(([rowIdx, cells]) => {
                const sorted = [...cells].sort((a, b) => a.t - b.t);
                return (
                  <div key={rowIdx} className="px-3 py-1 bg-gray-100 rounded text-xs">
                    <span className="font-medium">P{parseInt(rowIdx) + 1}</span>
                    <span className="text-gray-500 ml-1">
                      {sorted.map(c => `${c.type[0]}${c.t}`).join(' ')}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
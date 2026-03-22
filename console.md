simulationEngine.ts:105 Simulation exceeded max iterations
step @ simulationEngine.ts:105
runToCompletion @ simulationEngine.ts:414
initializeSimulation @ simulationStore.ts:105
loadScenario @ ScenarioSelector.tsx:126
onClick @ ScenarioSelector.tsx:138
callCallback2 @ chunk-BCXODTBQ.js?v=31b9560f:3672
invokeGuardedCallbackDev @ chunk-BCXODTBQ.js?v=31b9560f:3697
invokeGuardedCallback @ chunk-BCXODTBQ.js?v=31b9560f:3731
invokeGuardedCallbackAndCatchFirstError @ chunk-BCXODTBQ.js?v=31b9560f:3734
executeDispatch @ chunk-BCXODTBQ.js?v=31b9560f:7012
processDispatchQueueItemsInOrder @ chunk-BCXODTBQ.js?v=31b9560f:7032
processDispatchQueue @ chunk-BCXODTBQ.js?v=31b9560f:7041
dispatchEventsForPlugins @ chunk-BCXODTBQ.js?v=31b9560f:7049
(anonymous) @ chunk-BCXODTBQ.js?v=31b9560f:7172
batchedUpdates$1 @ chunk-BCXODTBQ.js?v=31b9560f:18911
batchedUpdates @ chunk-BCXODTBQ.js?v=31b9560f:3577
dispatchEventForPluginEventSystem @ chunk-BCXODTBQ.js?v=31b9560f:7171
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-BCXODTBQ.js?v=31b9560f:5476
dispatchEvent @ chunk-BCXODTBQ.js?v=31b9560f:5470
dispatchDiscreteEvent @ chunk-BCXODTBQ.js?v=31b9560f:5447
simulationEngine.ts:429 [Engine] First 30 events:
simulationEngine.ts:433   [0] t=0 PROCESS_ARRIVED P1
simulationEngine.ts:433   [1] t=0 PROCESS_DISPATCHED P1
simulationEngine.ts:433   [2] t=1 TIME_ADVANCED
simulationEngine.ts:433   [3] t=1 PROCESS_ARRIVED P2
simulationEngine.ts:433   [4] t=2 TIME_ADVANCED
simulationEngine.ts:433   [5] t=2 PROCESS_ARRIVED P3
simulationEngine.ts:433   [6] t=3 TIME_ADVANCED
simulationEngine.ts:433   [7] t=3 PROCESS_PREEMPTED P1
simulationEngine.ts:433   [8] t=3 PROCESS_DISPATCHED P2
simulationEngine.ts:433   [9] t=6 TIME_ADVANCED
simulationEngine.ts:433   [10] t=6 CPU_BURST_COMPLETED P2
simulationEngine.ts:433   [11] t=6 IO_BURST_STARTED P2
simulationEngine.ts:433   [12] t=6 PROCESS_DISPATCHED P3
simulationEngine.ts:433   [13] t=8 TIME_ADVANCED
simulationEngine.ts:433   [14] t=8 IO_BURST_COMPLETED P2
simulationEngine.ts:433   [15] t=9 TIME_ADVANCED
simulationEngine.ts:433   [16] t=9 PROCESS_PREEMPTED P3
simulationEngine.ts:433   [17] t=9 PROCESS_DISPATCHED P1
simulationEngine.ts:433   [18] t=10 TIME_ADVANCED
simulationEngine.ts:433   [19] t=10 CPU_BURST_COMPLETED P1
simulationEngine.ts:433   [20] t=10 IO_BURST_STARTED P1
simulationEngine.ts:433   [21] t=13 TIME_ADVANCED
simulationEngine.ts:433   [22] t=13 IO_BURST_COMPLETED P1
simulationEngine.ts:433   [23] t=14 TIME_ADVANCED
simulationEngine.ts:433   [24] t=15 TIME_ADVANCED
simulationEngine.ts:433   [25] t=16 TIME_ADVANCED
simulationEngine.ts:433   [26] t=17 TIME_ADVANCED
simulationEngine.ts:433   [27] t=18 TIME_ADVANCED
simulationEngine.ts:433   [28] t=19 TIME_ADVANCED
simulationEngine.ts:433   [29] t=20 TIME_ADVANCED
simulationEngine.ts:435 [Engine] Total events: 10015
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= -1
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= -1
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= -1 currentTime= 0 events.length= 10015
simulationStore.ts:142 [STEP] first step, going to events[0], time= 0
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= 0
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= 0
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 0 currentTime= 0 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 1 time= 0
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= 1
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 0 currentEventIndex= 1
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 1 currentTime= 0 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 2 time= 1
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 1 currentEventIndex= 2
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 1 currentEventIndex= 2
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 2 currentTime= 1 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 3 time= 1
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 1 currentEventIndex= 3
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 1 currentEventIndex= 3
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 3 currentTime= 1 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 4 time= 2
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 2 currentEventIndex= 4
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 2 currentEventIndex= 4
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 4 currentTime= 2 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 5 time= 2
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 2 currentEventIndex= 5
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 2 currentEventIndex= 5
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 5 currentTime= 2 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 6 time= 3
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 6
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 6
GanttChart.tsx:175 [GanttChart] cpuBlocks: []
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: []
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 0}
simulationStore.ts:133 [STEP] called: currentEventIndex= 6 currentTime= 3 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 7 time= 3
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 7
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 7
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 7 currentTime= 3 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 8 time= 3
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 3 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
simulationStore.ts:133 [STEP] called: currentEventIndex= 8 currentTime= 3 events.length= 10015
simulationStore.ts:151 [STEP] Advancing 1 tick: from 3 to 4
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 4 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 4 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
simulationStore.ts:133 [STEP] called: currentEventIndex= 8 currentTime= 4 events.length= 10015
simulationStore.ts:151 [STEP] Advancing 1 tick: from 4 to 5
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 5 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 5 currentEventIndex= 8
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
simulationStore.ts:133 [STEP] called: currentEventIndex= 8 currentTime= 5 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 9 time= 6
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 9
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 9
GanttChart.tsx:175 [GanttChart] cpuBlocks: [{…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P2', startTime: 3}
simulationStore.ts:133 [STEP] called: currentEventIndex= 9 currentTime= 6 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 10 time= 6
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 10
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 10
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: []
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 10 currentTime= 6 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 11 time= 6
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 11
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 11
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 11 currentTime= 6 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 12 time= 6
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 12
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 6 currentEventIndex= 12
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
simulationStore.ts:133 [STEP] called: currentEventIndex= 12 currentTime= 6 events.length= 10015
simulationStore.ts:151 [STEP] Advancing 1 tick: from 6 to 7
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 7 currentEventIndex= 12
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 7 currentEventIndex= 12
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
simulationStore.ts:133 [STEP] called: currentEventIndex= 12 currentTime= 7 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 13 time= 8
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 8 currentEventIndex= 13
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 8 currentEventIndex= 13
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: [3]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
simulationStore.ts:133 [STEP] called: currentEventIndex= 13 currentTime= 8 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 14 time= 8
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 8 currentEventIndex= 14
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (2) [3, 8]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 8 currentEventIndex= 14
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (2) [3, 8]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
simulationStore.ts:133 [STEP] called: currentEventIndex= 14 currentTime= 8 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 15 time= 9
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 15
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (2) [3, 8]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 15
GanttChart.tsx:175 [GanttChart] cpuBlocks: (2) [{…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (2) [3, 8]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P3', startTime: 6}
simulationStore.ts:133 [STEP] called: currentEventIndex= 15 currentTime= 9 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 16 time= 9
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 16
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 16
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 16 currentTime= 9 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 17 time= 9
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 17
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 9}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 9 currentEventIndex= 17
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 9}
simulationStore.ts:133 [STEP] called: currentEventIndex= 17 currentTime= 9 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 18 time= 10
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 18
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 9}
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 18
GanttChart.tsx:175 [GanttChart] cpuBlocks: (3) [{…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: {processId: 'P1', startTime: 9}
simulationStore.ts:133 [STEP] called: currentEventIndex= 18 currentTime= 10 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 19 time= 10
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 19
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 19
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: [{…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 19 currentTime= 10 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 20 time= 10
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 10 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 20 currentTime= 10 events.length= 10015
simulationStore.ts:151 [STEP] Advancing 1 tick: from 10 to 11
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 11 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 11 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 20 currentTime= 11 events.length= 10015
simulationStore.ts:151 [STEP] Advancing 1 tick: from 11 to 12
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 12 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 12 currentEventIndex= 20
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 20 currentTime= 12 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 21 time= 13
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 13 currentEventIndex= 21
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 13 currentEventIndex= 21
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (3) [3, 8, 9]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 21 currentTime= 13 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 22 time= 13
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 13 currentEventIndex= 22
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 13 currentEventIndex= 22
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 22 currentTime= 13 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 23 time= 14
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 14 currentEventIndex= 23
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 14 currentEventIndex= 23
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 23 currentTime= 14 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 24 time= 15
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 15 currentEventIndex= 24
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 15 currentEventIndex= 24
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
simulationStore.ts:133 [STEP] called: currentEventIndex= 24 currentTime= 15 events.length= 10015
simulationStore.ts:164 [STEP] advancing to index 25 time= 16
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 16 currentEventIndex= 25
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null
GanttChart.tsx:174 [GanttChart] Rendering: currentTime= 16 currentEventIndex= 25
GanttChart.tsx:175 [GanttChart] cpuBlocks: (4) [{…}, {…}, {…}, {…}]
GanttChart.tsx:176 [GanttChart] ioBlocks: (2) [{…}, {…}]
GanttChart.tsx:177 [GanttChart] rescheduleTimes: (4) [3, 8, 9, 13]
GanttChart.tsx:178 [GanttChart] currentCpuExecution: null

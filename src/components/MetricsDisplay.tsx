import { useSimulationStore } from '../application';

export default function MetricsDisplay() {
  const { metrics, currentEventIndex, events, processes } = useSimulationStore();

  // Only show final metrics when simulation is complete
  const isComplete = currentEventIndex >= events.length - 1 && events.length > 0;

  if (!metrics || !isComplete) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Metriken</h3>
        <div className="text-sm text-gray-500 italic">
          Metriken werden nach Abschluss der Simulation angezeigt.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Metriken</h3>

      {/* Average Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium">Durchschn. Waiting Time</div>
          <div className="text-2xl font-bold text-blue-900">
            {metrics.averages.waitingTime.toFixed(2)}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-600 font-medium">Durchschn. Turnaround Time</div>
          <div className="text-2xl font-bold text-green-900">
            {metrics.averages.turnaroundTime.toFixed(2)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-purple-600 font-medium">Durchschn. Response Time</div>
          <div className="text-2xl font-bold text-purple-900">
            {metrics.averages.responseTime.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Per-Process Metrics */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium text-gray-600">Prozess</th>
              <th className="text-right py-2 px-2 font-medium text-gray-600">Waiting Time</th>
              <th className="text-right py-2 px-2 font-medium text-gray-600">Turnaround Time</th>
              <th className="text-right py-2 px-2 font-medium text-gray-600">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {metrics.processes.map((proc) => (
              <tr key={proc.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{proc.id}</td>
                <td className="text-right py-2 px-2">{proc.waitingTime}</td>
                <td className="text-right py-2 px-2">{proc.turnaroundTime}</td>
                <td className="text-right py-2 px-2">{proc.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

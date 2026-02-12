import type { LogEntry } from "../mock/data";

interface LogConsoleProps {
  logs: LogEntry[];
}

export function LogConsole({ logs }: LogConsoleProps) {
  return (
    <div className="log-console">
      <h3>Log Console</h3>
      <div className="log-entries">
        {logs.length === 0 && <div className="log-empty">No logs yet...</div>}
        {logs.map((entry) => (
          <div key={entry.id} className={`log-entry ${entry.level}`}>
            <span className="log-ts">{entry.timestamp}</span>
            <span className={`log-level ${entry.level}`}>[{entry.level.toUpperCase()}]</span>
            <span className="log-msg">{entry.message}</span>
            {entry.detail && <div className="log-detail">{entry.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

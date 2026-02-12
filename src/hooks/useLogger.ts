import { useCallback, useState } from "react";
import type { LogEntry } from "../mock/data";

let logCounter = 0;

function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback(
    (level: LogEntry["level"], message: string, detail?: string) => {
      setLogs((prev) => [
        ...prev,
        { id: `log-${++logCounter}`, timestamp: ts(), level, message, detail },
      ]);
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, log, clearLogs } as const;
}

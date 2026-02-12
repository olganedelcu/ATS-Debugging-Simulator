import { useEffect, useState } from "react";
import "./App.css";
import type { KomboSyncedJob } from "./mock/data";
import { getSyncedJobs } from "./mock/komboService";
import { useLogger } from "./hooks/useLogger";
import { useDebugFlow } from "./hooks/useDebugFlow";
import { StepBar } from "./components/StepBar";
import { JobList } from "./components/JobList";
import { SubmitForm } from "./components/SubmitForm";
import { ResponseBox } from "./components/ResponseBox";
import { DebugActions } from "./components/DebugActions";
import { LogConsole } from "./components/LogConsole";

function App() {
  const [jobs, setJobs] = useState<KomboSyncedJob[]>([]);
  const { logs, log, clearLogs } = useLogger();
  const {
    state,
    handleSubmit,
    handleTraceIds,
    handleCheckStatus,
    handleApplyFix,
    handleSelectJob,
    handleAdvanceStep,
    handleReset,
  } = useDebugFlow(log, clearLogs);

  useEffect(() => {
    getSyncedJobs().then((data) => {
      setJobs(data);
      log("info", "Loaded synced jobs from Kombo", `${data.length} jobs`);
    });
  }, [log]);

  return (
    <div className="app">
      <header>
        <h1>Kombo ATS Debugging Simulator</h1>
        <p className="subtitle">Find and fix the integration bugs</p>
      </header>

      <StepBar currentStep={state.step} />

      <div className="panels">
        <div className="panel left">
          <JobList
            jobs={jobs}
            selectedJobId={state.selectedJob?.komboId ?? null}
            onSelectJob={handleSelectJob}
          />
          {state.selectedJob && (
            <SubmitForm
              selectedJob={state.selectedJob}
              useFixedId={state.useFixedId}
              loading={state.loading}
              step={state.step}
              onSubmit={handleSubmit}
            />
          )}
          {state.lastResponse && <ResponseBox response={state.lastResponse} />}
        </div>
        <div className="panel right">
          <DebugActions
            step={state.step}
            selectedJob={state.selectedJob}
            lastPayload={state.lastPayload}
            idMapping={state.idMapping}
            atsStatus={state.atsStatus}
            onAdvanceStep={handleAdvanceStep}
            onTraceIds={handleTraceIds}
            onCheckStatus={handleCheckStatus}
            onApplyFix={handleApplyFix}
            onReset={handleReset}
          />
          <LogConsole logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;

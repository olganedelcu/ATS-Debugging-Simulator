import { useCallback, useEffect, useState } from "react";
import "./App.css";
import type {
  AtsApiResponse,
  DebugStep,
  KomboSyncedJob,
  LogEntry,
} from "./mock/data";
import {
  getSyncedJobs,
  submitApplication,
  lookupIdMapping,
  checkJobStatus,
} from "./mock/komboService";

const STEPS: { key: DebugStep; label: string }[] = [
  { key: "start", label: "Select & Submit" },
  { key: "submitted", label: "See Response" },
  { key: "view-logs", label: "View Logs" },
  { key: "inspect-payload", label: "Inspect Payload" },
  { key: "trace-ids", label: "Trace IDs" },
  { key: "check-status", label: "Check ATS" },
  { key: "apply-fix", label: "Apply Fix" },
  { key: "resubmit", label: "Resubmit" },
  { key: "resolved", label: "Resolved" },
];

function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

function App() {
  const [jobs, setJobs] = useState<KomboSyncedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<KomboSyncedJob | null>(null);
  const [step, setStep] = useState<DebugStep>("start");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastResponse, setLastResponse] = useState<AtsApiResponse | null>(null);
  const [lastPayload, setLastPayload] = useState<Record<string, string> | null>(null);
  const [idMapping, setIdMapping] = useState<Awaited<ReturnType<typeof lookupIdMapping>> | null>(null);
  const [atsStatus, setAtsStatus] = useState<Awaited<ReturnType<typeof checkJobStatus>> | null>(null);
  const [useFixedId, setUseFixedId] = useState(false);
  const [loading, setLoading] = useState(false);

  const log = useCallback(
    (level: LogEntry["level"], message: string, detail?: string) => {
      setLogs((prev) => [...prev, { timestamp: ts(), level, message, detail }]);
    },
    []
  );

  // Load jobs on mount
  useEffect(() => {
    getSyncedJobs().then((data) => {
      setJobs(data);
      log("info", "Loaded synced jobs from Kombo", `${data.length} jobs`);
    });
  }, [log]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // --- Actions ---

  async function handleSubmit() {
    if (!selectedJob) return;
    setLoading(true);

    const jobId = useFixedId ? selectedJob.remoteId : selectedJob.komboId;
    const payload = {
      jobId,
      candidateName: "Jane Doe",
      candidateEmail: "jane@example.com",
    };
    setLastPayload({ job_id: jobId, candidate_name: payload.candidateName, candidate_email: payload.candidateEmail });

    log("info", `POST /ats/applications`, `job_id: ${jobId}`);

    const res = await submitApplication(payload);
    setLastResponse(res);
    setLoading(false);

    if (res.success) {
      log("success", "Application submitted successfully", res.message);
      setStep("resolved");
    } else {
      log("error", `Request failed: ${res.message}`);
      if (res.message.includes("archived")) {
        setStep("handle-archived");
      } else if (useFixedId) {
        // Shouldn't happen for open jobs, but handle edge case
        setStep("submitted");
      } else {
        setStep("submitted");
      }
    }
  }

  async function handleTraceIds() {
    if (!selectedJob) return;
    setLoading(true);
    const mapping = await lookupIdMapping(selectedJob.komboId);
    setIdMapping(mapping);
    setLoading(false);
    log(
      "warn",
      `ID mapping: komboId=${mapping.komboId} → remoteId=${mapping.remoteId}`,
      `ATS job found: ${!!mapping.atsJob}`
    );
    setStep("trace-ids");
  }

  async function handleCheckStatus() {
    if (!idMapping?.remoteId) return;
    setLoading(true);
    const status = await checkJobStatus(idMapping.remoteId);
    setAtsStatus(status);
    setLoading(false);
    if (status.found) {
      log(
        status.status === "archived" ? "warn" : "info",
        `ATS job ${status.atsJobId}: status=${status.status}`,
        status.archivedAt ? `Archived at: ${status.archivedAt}` : undefined
      );
    } else {
      log("error", `ATS job ${status.atsJobId} not found`);
    }
    setStep("check-status");
  }

  function handleApplyFix() {
    setUseFixedId(true);
    log("success", "Fix applied: now using remoteId instead of komboId");
    setStep("apply-fix");
  }

  function handleReset() {
    setSelectedJob(null);
    setStep("start");
    setLogs([]);
    setLastResponse(null);
    setLastPayload(null);
    setIdMapping(null);
    setAtsStatus(null);
    setUseFixedId(false);
    log("info", "Session reset — pick a new job");
  }

  // --- Render helpers ---

  function renderStepBar() {
    return (
      <div className="step-bar">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`step-item ${i < stepIndex ? "done" : ""} ${i === stepIndex ? "active" : ""}`}
          >
            <span className="step-dot">{i < stepIndex ? "\u2713" : i + 1}</span>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>
    );
  }

  function renderJobList() {
    return (
      <div className="job-list">
        <h3>Kombo Synced Jobs</h3>
        {jobs.map((job) => (
          <div
            key={job.komboId}
            className={`job-card ${selectedJob?.komboId === job.komboId ? "selected" : ""}`}
            onClick={() => {
              if (step === "start") {
                setSelectedJob(job);
                log("info", `Selected: ${job.title}`, `komboId: ${job.komboId}`);
              }
            }}
          >
            <div className="job-title">{job.title}</div>
            <div className="job-meta">
              <span className={`badge ${job.status}`}>{job.status}</span>
              <code className="mono">{job.komboId}</code>
            </div>
            <div className="job-sync">
              Last synced: {new Date(job.lastSyncedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderForm() {
    if (!selectedJob) return null;
    return (
      <div className="form-section">
        <h3>Submit Application</h3>
        <div className="form-fields">
          <label>
            Job ID being sent:
            <code className={`mono ${useFixedId ? "fixed-id" : "buggy-id"}`}>
              {useFixedId ? selectedJob.remoteId : selectedJob.komboId}
            </code>
            {useFixedId && <span className="badge success">fixed</span>}
          </label>
          <label>
            Candidate: <span>Jane Doe (jane@example.com)</span>
          </label>
        </div>
        <button
          className="btn primary"
          onClick={handleSubmit}
          disabled={loading || (step !== "start" && step !== "apply-fix" && step !== "handle-archived")}
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    );
  }

  function renderResponse() {
    if (!lastResponse) return null;
    return (
      <div className={`response-box ${lastResponse.success ? "success" : "error"}`}>
        <h4>API Response</h4>
        <pre>{JSON.stringify(lastResponse, null, 2)}</pre>
      </div>
    );
  }

  function renderLogs() {
    return (
      <div className="log-console">
        <h3>Log Console</h3>
        <div className="log-entries">
          {logs.length === 0 && <div className="log-empty">No logs yet...</div>}
          {logs.map((entry, i) => (
            <div key={i} className={`log-entry ${entry.level}`}>
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

  function renderDebugActions() {
    return (
      <div className="debug-actions">
        <h3>Debug Tools</h3>

        {step === "submitted" && (
          <button className="btn" onClick={() => setStep("view-logs")}>
            1. View Request Logs
          </button>
        )}

        {step === "view-logs" && (
          <button className="btn" onClick={() => setStep("inspect-payload")}>
            2. Inspect Payload
          </button>
        )}

        {step === "inspect-payload" && lastPayload && (
          <div className="inspect-panel">
            <h4>Request Payload</h4>
            <pre className="payload-highlight">
              {JSON.stringify(lastPayload, null, 2)}
            </pre>
            <div className="hint warn">
              Look at the <code>job_id</code> value. Does it look like a Kombo
              internal UUID or an ATS provider ID?
            </div>
            <button className="btn" onClick={handleTraceIds}>
              3. Trace ID Mapping
            </button>
          </div>
        )}

        {step === "trace-ids" && idMapping && (
          <div className="inspect-panel">
            <h4>ID Mapping</h4>
            <table className="mapping-table">
              <tbody>
                <tr>
                  <td>Kombo ID (internal)</td>
                  <td><code className="mono buggy-id">{idMapping.komboId}</code></td>
                </tr>
                <tr>
                  <td>Remote ID (ATS)</td>
                  <td><code className="mono fixed-id">{idMapping.remoteId}</code></td>
                </tr>
                <tr>
                  <td>ATS Job exists?</td>
                  <td>{idMapping.atsJob ? "Yes" : "No"}</td>
                </tr>
              </tbody>
            </table>
            <div className="hint info">
              The API received <code>{idMapping.komboId}</code> but the ATS
              expects <code>{idMapping.remoteId}</code>. These are different!
            </div>
            <button className="btn" onClick={handleCheckStatus}>
              4. Check Job Status in ATS
            </button>
          </div>
        )}

        {step === "check-status" && atsStatus && (
          <div className="inspect-panel">
            <h4>ATS Job Status</h4>
            <table className="mapping-table">
              <tbody>
                <tr>
                  <td>ATS Job ID</td>
                  <td><code className="mono">{atsStatus.atsJobId}</code></td>
                </tr>
                <tr>
                  <td>Found</td>
                  <td>{atsStatus.found ? "Yes" : "No"}</td>
                </tr>
                {atsStatus.status && (
                  <tr>
                    <td>Status</td>
                    <td>
                      <span className={`badge ${atsStatus.status}`}>{atsStatus.status}</span>
                    </td>
                  </tr>
                )}
                {atsStatus.archivedAt && (
                  <tr>
                    <td>Archived At</td>
                    <td>{new Date(atsStatus.archivedAt).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {atsStatus.status === "archived" && (
              <div className="hint warn">
                This job was archived in the ATS, but Kombo's sync data still
                shows it as "open" (last synced 3 days ago). This is the second
                bug — stale sync data!
              </div>
            )}
            <button className="btn success" onClick={handleApplyFix}>
              5. Apply Fix: Use Remote ID
            </button>
          </div>
        )}

        {step === "apply-fix" && (
          <div className="inspect-panel">
            <div className="hint success">
              Fix applied! The payload will now send <code>{selectedJob?.remoteId}</code>{" "}
              (the ATS provider's ID) instead of <code>{selectedJob?.komboId}</code>{" "}
              (Kombo's internal ID). Click Submit to retry.
            </div>
          </div>
        )}

        {step === "handle-archived" && (
          <div className="inspect-panel">
            <div className="hint warn">
              Bug #1 is fixed (correct ID), but now the ATS says the job is{" "}
              <strong>archived</strong>. Kombo's synced data was stale — it
              showed the job as "open" because the last sync was 3 days ago, but
              the ATS archived it yesterday.
            </div>
            <div className="hint info">
              In production you would: re-trigger a sync, filter out stale jobs,
              or check the ATS directly before submitting.
            </div>
            <button className="btn success" onClick={() => setStep("resolved")}>
              Mark Resolved
            </button>
          </div>
        )}

        {step === "resolved" && (
          <div className="resolution-panel">
            <h4>Resolution Summary</h4>
            <div className="lesson">
              <strong>Bug #1 - Wrong ID type:</strong> The app sent Kombo's
              internal UUID (<code>komboId</code>) to the ATS, which expects its
              own provider ID (<code>remoteId</code>). Always use the{" "}
              <code>remote_id</code> field when making calls that reach the
              underlying ATS.
            </div>
            {selectedJob?.komboId === "kombo-uuid-bb22" && (
              <div className="lesson">
                <strong>Bug #2 - Stale sync data:</strong> Kombo's last sync was
                3 days ago, so the job still appeared "open" locally. In
                reality the ATS archived it yesterday. Build in freshness
                checks or force a re-sync before critical operations.
              </div>
            )}
            <button className="btn" onClick={handleReset}>
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Kombo ATS Debugging Simulator</h1>
        <p className="subtitle">Find and fix the integration bugs</p>
      </header>

      {renderStepBar()}

      <div className="panels">
        <div className="panel left">
          {renderJobList()}
          {renderForm()}
          {renderResponse()}
        </div>
        <div className="panel right">
          {renderDebugActions()}
          {renderLogs()}
        </div>
      </div>
    </div>
  );
}

export default App;

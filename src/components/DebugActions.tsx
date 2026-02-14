import type { AtsJobStatus, DebugStep, IdMapping, SyncedJob } from "../mock/data";
import { Hint } from "./Hint";
import { MappingTable } from "./MappingTable";
import { ResolutionPanel } from "./ResolutionPanel";

interface DebugActionsProps {
  step: DebugStep;
  selectedJob: SyncedJob | null;
  lastPayload: Record<string, string> | null;
  idMapping: IdMapping | null;
  atsStatus: AtsJobStatus | null;
  onAdvanceStep: (step: DebugStep) => void;
  onTraceIds: () => void;
  onCheckStatus: () => void;
  onApplyFix: () => void;
  onReset: () => void;
}

export function DebugActions({
  step,
  selectedJob,
  lastPayload,
  idMapping,
  atsStatus,
  onAdvanceStep,
  onTraceIds,
  onCheckStatus,
  onApplyFix,
  onReset,
}: DebugActionsProps) {
  return (
    <div className="debug-actions">
      <h3>Debug Tools</h3>

      {step === "submitted" && (
        <button className="btn" onClick={() => onAdvanceStep("view-logs")}>
          1. View Request Logs
        </button>
      )}

      {step === "view-logs" && (
        <button className="btn" onClick={() => onAdvanceStep("inspect-payload")}>
          2. Inspect Payload
        </button>
      )}

      {step === "inspect-payload" && lastPayload && (
        <div className="inspect-panel">
          <h4>Request Payload</h4>
          <pre className="payload-highlight">
            {JSON.stringify(lastPayload, null, 2)}
          </pre>
          <Hint variant="warn">
            Look at the <code>job_id</code> value. Does it look like an
            internal UUID or an ATS provider ID?
          </Hint>
          <button className="btn" onClick={onTraceIds}>
            3. Trace ID Mapping
          </button>
        </div>
      )}

      {step === "trace-ids" && idMapping && (
        <div className="inspect-panel">
          <h4>ID Mapping</h4>
          <MappingTable
            rows={[
              { label: "Internal ID", value: <code className="mono buggy-id">{idMapping.internalId}</code> },
              { label: "Remote ID (ATS)", value: <code className="mono fixed-id">{idMapping.remoteId}</code> },
              { label: "ATS Job exists?", value: idMapping.atsJob ? "Yes" : "No" },
            ]}
          />
          <Hint variant="info">
            The API received <code>{idMapping.internalId}</code> but the ATS
            expects <code>{idMapping.remoteId}</code>. These are different!
          </Hint>
          <button className="btn" onClick={onCheckStatus}>
            4. Check Job Status in ATS
          </button>
        </div>
      )}

      {step === "check-status" && atsStatus && (
        <div className="inspect-panel">
          <h4>ATS Job Status</h4>
          <MappingTable
            rows={[
              { label: "ATS Job ID", value: <code className="mono">{atsStatus.atsJobId}</code> },
              { label: "Found", value: atsStatus.found ? "Yes" : "No" },
              ...(atsStatus.status
                ? [{ label: "Status", value: <span className={`badge ${atsStatus.status}`}>{atsStatus.status}</span> }]
                : []),
              ...(atsStatus.archivedAt
                ? [{ label: "Archived At", value: new Date(atsStatus.archivedAt).toLocaleString() }]
                : []),
            ]}
          />
          {atsStatus.status === "archived" && (
            <Hint variant="warn">
              This job was archived in the ATS, but the sync data still
              shows it as "open" (last synced 3 days ago). This is the second
              bug — stale sync data!
            </Hint>
          )}
          <button className="btn success" onClick={onApplyFix}>
            5. Apply Fix: Use Remote ID
          </button>
        </div>
      )}

      {step === "apply-fix" && selectedJob && (
        <div className="inspect-panel">
          <Hint variant="success">
            Fix applied! The payload will now send <code>{selectedJob.remoteId}</code>{" "}
            (the ATS provider's ID) instead of <code>{selectedJob.internalId}</code>{" "}
            (the internal ID). Click Submit to retry.
          </Hint>
        </div>
      )}

      {step === "handle-archived" && (
        <div className="inspect-panel">
          <Hint variant="warn">
            Bug #1 is fixed (correct ID), but now the ATS says the job is{" "}
            <strong>archived</strong>. The synced data was stale — it
            showed the job as "open" because the last sync was 3 days ago, but
            the ATS archived it yesterday.
          </Hint>
          <Hint variant="info">
            In production you would: re-trigger a sync, filter out stale jobs,
            or check the ATS directly before submitting.
          </Hint>
          <button className="btn success" onClick={() => onAdvanceStep("resolved")}>
            Mark Resolved
          </button>
        </div>
      )}

      {step === "resolved" && selectedJob && (
        <ResolutionPanel
          selectedJobInternalId={selectedJob.internalId}
          onReset={onReset}
        />
      )}
    </div>
  );
}

import type { DebugStep, SyncedJob } from "../mock/data";

interface SubmitFormProps {
  selectedJob: SyncedJob;
  useFixedId: boolean;
  loading: boolean;
  step: DebugStep;
  onSubmit: () => void;
}

export function SubmitForm({ selectedJob, useFixedId, loading, step, onSubmit }: SubmitFormProps) {
  const canSubmit = step === "start" || step === "apply-fix" || step === "handle-archived";
  return (
    <div className="form-section">
      <h3>Submit Application</h3>
      <div className="form-fields">
        <label>
          Job ID being sent:
          <code className={`mono ${useFixedId ? "fixed-id" : "buggy-id"}`}>
            {useFixedId ? selectedJob.remoteId : selectedJob.internalId}
          </code>
          {useFixedId && <span className="badge success">fixed</span>}
        </label>
        <label>
          Candidate: <span>Jane Doe (jane@example.com)</span>
        </label>
      </div>
      <button
        className="btn primary"
        onClick={onSubmit}
        disabled={loading || !canSubmit}
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}

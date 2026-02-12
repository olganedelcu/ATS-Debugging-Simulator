import { useReducer } from "react";
import type {
  AtsApiResponse,
  AtsJobStatus,
  DebugStep,
  IdMapping,
  KomboSyncedJob,
  LogEntry,
} from "../mock/data";
import {
  submitApplication,
  lookupIdMapping,
  checkJobStatus,
} from "../mock/komboService";

export interface DebugFlowState {
  step: DebugStep;
  selectedJob: KomboSyncedJob | null;
  lastResponse: AtsApiResponse | null;
  lastPayload: Record<string, string> | null;
  idMapping: IdMapping | null;
  atsStatus: AtsJobStatus | null;
  useFixedId: boolean;
  loading: boolean;
}

type DebugFlowAction =
  | { type: "SELECT_JOB"; job: KomboSyncedJob }
  | { type: "SET_LOADING" }
  | { type: "SUBMIT_SUCCESS"; response: AtsApiResponse; payload: Record<string, string> }
  | { type: "SUBMIT_FAILURE"; response: AtsApiResponse; payload: Record<string, string>; isArchived: boolean }
  | { type: "TRACE_IDS_COMPLETE"; mapping: IdMapping }
  | { type: "CHECK_STATUS_COMPLETE"; status: AtsJobStatus }
  | { type: "ADVANCE_STEP"; step: DebugStep }
  | { type: "APPLY_FIX" }
  | { type: "RESET" };

const initialState: DebugFlowState = {
  step: "start",
  selectedJob: null,
  lastResponse: null,
  lastPayload: null,
  idMapping: null,
  atsStatus: null,
  useFixedId: false,
  loading: false,
};

function debugFlowReducer(state: DebugFlowState, action: DebugFlowAction): DebugFlowState {
  switch (action.type) {
    case "SELECT_JOB":
      if (state.step !== "start") return state;
      return { ...state, selectedJob: action.job };

    case "SET_LOADING":
      return { ...state, loading: true };

    case "SUBMIT_SUCCESS":
      return { ...state, lastResponse: action.response, lastPayload: action.payload, loading: false, step: "resolved" };

    case "SUBMIT_FAILURE":
      return { ...state, lastResponse: action.response, lastPayload: action.payload, loading: false, step: action.isArchived ? "handle-archived" : "submitted" };

    case "TRACE_IDS_COMPLETE":
      return { ...state, idMapping: action.mapping, loading: false, step: "trace-ids" };

    case "CHECK_STATUS_COMPLETE":
      return { ...state, atsStatus: action.status, loading: false, step: "check-status" };

    case "ADVANCE_STEP":
      return { ...state, step: action.step };

    case "APPLY_FIX":
      return { ...state, useFixedId: true, step: "apply-fix" };

    case "RESET":
      return { ...initialState };
  }
}

type LogFn = (level: LogEntry["level"], message: string, detail?: string) => void;

export function useDebugFlow(log: LogFn, clearLogs: () => void) {
  const [state, dispatch] = useReducer(debugFlowReducer, initialState);

  async function handleSubmit() {
    if (!state.selectedJob) return;
    dispatch({ type: "SET_LOADING" });

    const jobId = state.useFixedId ? state.selectedJob.remoteId : state.selectedJob.komboId;
    const payload = {
      job_id: jobId,
      candidate_name: "Jane Doe",
      candidate_email: "jane@example.com",
    };

    log("info", `POST /ats/applications`, `job_id: ${jobId}`);

    const res = await submitApplication({ jobId, candidateName: "Jane Doe", candidateEmail: "jane@example.com" });

    if (res.success) {
      log("success", "Application submitted successfully", res.message);
      dispatch({ type: "SUBMIT_SUCCESS", response: res, payload });
    } else {
      log("error", `Request failed: ${res.message}`);
      dispatch({ type: "SUBMIT_FAILURE", response: res, payload, isArchived: res.message.includes("archived") });
    }
  }

  async function handleTraceIds() {
    if (!state.selectedJob) return;
    dispatch({ type: "SET_LOADING" });
    const mapping = await lookupIdMapping(state.selectedJob.komboId);
    log("warn", `ID mapping: komboId=${mapping.komboId} → remoteId=${mapping.remoteId}`, `ATS job found: ${!!mapping.atsJob}`);
    dispatch({ type: "TRACE_IDS_COMPLETE", mapping });
  }

  async function handleCheckStatus() {
    if (!state.idMapping?.remoteId) return;
    dispatch({ type: "SET_LOADING" });
    const status = await checkJobStatus(state.idMapping.remoteId);
    if (status.found) {
      log(
        status.status === "archived" ? "warn" : "info",
        `ATS job ${status.atsJobId}: status=${status.status}`,
        status.archivedAt ? `Archived at: ${status.archivedAt}` : undefined
      );
    } else {
      log("error", `ATS job ${status.atsJobId} not found`);
    }
    dispatch({ type: "CHECK_STATUS_COMPLETE", status });
  }

  function handleApplyFix() {
    log("success", "Fix applied: now using remoteId instead of komboId");
    dispatch({ type: "APPLY_FIX" });
  }

  function handleSelectJob(job: KomboSyncedJob) {
    dispatch({ type: "SELECT_JOB", job });
    log("info", `Selected: ${job.title}`, `komboId: ${job.komboId}`);
  }

  function handleAdvanceStep(step: DebugStep) {
    dispatch({ type: "ADVANCE_STEP", step });
  }

  function handleReset() {
    dispatch({ type: "RESET" });
    clearLogs();
    log("info", "Session reset — pick a new job");
  }

  return {
    state,
    handleSubmit,
    handleTraceIds,
    handleCheckStatus,
    handleApplyFix,
    handleSelectJob,
    handleAdvanceStep,
    handleReset,
  } as const;
}

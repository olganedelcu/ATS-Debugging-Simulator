import {
  atsJobs,
  komboSyncedJobs,
  type KomboSyncedJob,
  type ApplicationPayload,
  type AtsApiResponse,
  type IdMapping,
  type AtsJobStatus,
} from "./data";

const SIMULATED_DELAY = 600;

function delay(ms = SIMULATED_DELAY): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** returns the list of jobs as seen through Kombo's sync layer. */
export async function getSyncedJobs(): Promise<KomboSyncedJob[]> {
  await delay();
  return komboSyncedJobs;
}

/**
 * Submit an application via Kombo → ATS.
 *
 * Bug surface:
 * - If `payload.jobId` is a komboId (not an atsJobId), the ATS won't find it.
 * - If the ATS job is archived, the application is rejected even with the right ID.
 */
export async function submitApplication(
  payload: ApplicationPayload
): Promise<AtsApiResponse> {
  await delay();

  // The ATS looks up the job by atsJobId
  const atsJob = atsJobs.find((j) => j.atsJobId === payload.jobId);

  if (!atsJob) {
    return {
      status: 200,
      success: false,
      message: `Invalid job_id: no job found for id "${payload.jobId}"`,
    };
  }

  if (atsJob.status === "archived") {
    return {
      status: 200,
      success: false,
      message: `Job "${atsJob.title}" (${atsJob.atsJobId}) is archived and no longer accepting applications.`,
      data: { archivedAt: atsJob.archivedAt },
    };
  }

  return {
    status: 200,
    success: true,
    message: `Application for "${atsJob.title}" submitted successfully.`,
    data: {
      applicationId: "app-" + Math.random().toString(36).slice(2, 8),
    },
  };
}

/** Debug helper: show how a Kombo ID maps to a remote ATS ID. */
export async function lookupIdMapping(
  komboId: string
): Promise<IdMapping> {
  await delay(300);
  const synced = komboSyncedJobs.find((j) => j.komboId === komboId);
  if (!synced) return { komboId, remoteId: null, atsJob: null };
  const atsJob = atsJobs.find((j) => j.atsJobId === synced.remoteId) ?? null;
  return { komboId, remoteId: synced.remoteId, atsJob };
}

/** Debug helper: check current status of a job directly in the ATS. */
export async function checkJobStatus(
  atsJobId: string
): Promise<AtsJobStatus> {
  await delay(300);
  const job = atsJobs.find((j) => j.atsJobId === atsJobId);
  if (!job) return { found: false, atsJobId };
  return {
    found: true,
    atsJobId,
    status: job.status,
    archivedAt: job.archivedAt,
  };
}

import {
  atsJobs,
  syncedJobs,
  type SyncedJob,
  type ApplicationPayload,
  type AtsApiResponse,
  type IdMapping,
  type AtsJobStatus,
} from "./data";

const SIMULATED_DELAY = 600;

function delay(ms = SIMULATED_DELAY): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** returns the list of jobs as seen through the sync layer. */
export async function getSyncedJobs(): Promise<SyncedJob[]> {
  await delay();
  return syncedJobs;
}

/**
 * Submit an application via the sync layer → ATS.
 *
 * Bug surface:
 * - If `payload.jobId` is an internalId (not an atsJobId), the ATS won't find it.
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

/** Debug helper: show how an internal ID maps to a remote ATS ID. */
export async function lookupIdMapping(
  internalId: string
): Promise<IdMapping> {
  await delay(300);
  const synced = syncedJobs.find((j) => j.internalId === internalId);
  if (!synced) return { internalId, remoteId: null, atsJob: null };
  const atsJob = atsJobs.find((j) => j.atsJobId === synced.remoteId) ?? null;
  return { internalId, remoteId: synced.remoteId, atsJob };
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

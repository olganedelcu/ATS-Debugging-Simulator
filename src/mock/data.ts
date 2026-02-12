// types

export interface AtsJob {
  atsJobId: string;
  title: string;
  status: "open" | "archived";
  archivedAt: string | null;
  company: string;
  location: string;
}

export interface KomboSyncedJob {
  komboId: string;
  remoteId: string;
  title: string;
  status: "open" | "archived";
  lastSyncedAt: string;
}

export interface ApplicationPayload {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
}

export interface AtsApiResponse {
  status: number;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  detail?: string;
}

export type DebugStep =
  | "start"
  | "submitted"
  | "view-logs"
  | "inspect-payload"
  | "trace-ids"
  | "check-status"
  | "apply-fix"
  | "resubmit"
  | "handle-archived"
  | "resolved";

// helpers

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

//mock ATS data (what lives in GreenATS)

export const atsJobs: AtsJob[] = [
  {
    atsJobId: "green-ats-4821",
    title: "Senior Frontend Engineer",
    status: "open",
    archivedAt: null,
    company: "Acme Corp",
    location: "Berlin, DE",
  },
  {
    atsJobId: "green-ats-4822",
    title: "Staff Backend Engineer",
    status: "archived",
    archivedAt: daysAgo(1),
    company: "Acme Corp",
    location: "Remote, EU",
  },
  {
    atsJobId: "green-ats-4823",
    title: "Product Designer",
    status: "open",
    archivedAt: null,
    company: "Acme Corp",
    location: "London, UK",
  },
];

// lombo synced jobs (what your app sees via Kombo) 

export const komboSyncedJobs: KomboSyncedJob[] = [
  {
    komboId: "kombo-uuid-aa11",
    remoteId: "green-ats-4821",
    title: "Senior Frontend Engineer",
    status: "open",
    lastSyncedAt: daysAgo(0),
  },
  {
    komboId: "kombo-uuid-bb22",
    remoteId: "green-ats-4822",
    title: "Staff Backend Engineer",
    status: "open", // stale! ATS archived it yesterday, but sync is 3 days old
    lastSyncedAt: daysAgo(3),
  },
  {
    komboId: "kombo-uuid-cc33",
    remoteId: "green-ats-4823",
    title: "Product Designer",
    status: "open",
    lastSyncedAt: daysAgo(0),
  },
];

import type { SyncedJob } from "../mock/data";

interface JobCardProps {
  job: SyncedJob;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  return (
    <div
      className={`job-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="job-title">{job.title}</div>
      <div className="job-meta">
        <span className={`badge ${job.status}`}>{job.status}</span>
        <code className="mono">{job.internalId}</code>
      </div>
      <div className="job-sync">
        Last synced: {new Date(job.lastSyncedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

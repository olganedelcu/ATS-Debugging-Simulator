import type { KomboSyncedJob } from "../mock/data";

interface JobCardProps {
  job: KomboSyncedJob;
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
        <code className="mono">{job.komboId}</code>
      </div>
      <div className="job-sync">
        Last synced: {new Date(job.lastSyncedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

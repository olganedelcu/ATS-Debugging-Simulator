import type { SyncedJob } from "../mock/data";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: SyncedJob[];
  selectedJobId: string | null;
  onSelectJob: (job: SyncedJob) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <div className="job-list">
      <h3>Synced Jobs</h3>
      {jobs.map((job) => (
        <JobCard
          key={job.internalId}
          job={job}
          isSelected={job.internalId === selectedJobId}
          onClick={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

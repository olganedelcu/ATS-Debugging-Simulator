import type { KomboSyncedJob } from "../mock/data";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: KomboSyncedJob[];
  selectedJobId: string | null;
  onSelectJob: (job: KomboSyncedJob) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <div className="job-list">
      <h3>Kombo Synced Jobs</h3>
      {jobs.map((job) => (
        <JobCard
          key={job.komboId}
          job={job}
          isSelected={job.komboId === selectedJobId}
          onClick={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

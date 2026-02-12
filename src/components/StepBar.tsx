import type { DebugStep } from "../mock/data";

const STEPS: { key: DebugStep; label: string }[] = [
  { key: "start", label: "Select & Submit" },
  { key: "submitted", label: "See Response" },
  { key: "view-logs", label: "View Logs" },
  { key: "inspect-payload", label: "Inspect Payload" },
  { key: "trace-ids", label: "Trace IDs" },
  { key: "check-status", label: "Check ATS" },
  { key: "apply-fix", label: "Apply Fix" },
  { key: "resubmit", label: "Resubmit" },
  { key: "resolved", label: "Resolved" },
];

interface StepBarProps {
  currentStep: DebugStep;
}

export function StepBar({ currentStep }: StepBarProps) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  return (
    <div className="step-bar">
      {STEPS.map((s, i) => (
        <div
          key={s.key}
          className={`step-item ${i < stepIndex ? "done" : ""} ${i === stepIndex ? "active" : ""}`}
        >
          <span className="step-dot">{i < stepIndex ? "\u2713" : i + 1}</span>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

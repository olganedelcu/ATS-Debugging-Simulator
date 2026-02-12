import type { ReactNode } from "react";

interface HintProps {
  variant: "warn" | "info" | "success";
  children: ReactNode;
}

export function Hint({ variant, children }: HintProps) {
  return <div className={`hint ${variant}`}>{children}</div>;
}

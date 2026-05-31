import type { SeverityCounts } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeverityBarProps {
  counts: SeverityCounts;
  className?: string;
}

export function SeverityBar({ counts, className }: SeverityBarProps) {
  const total =
    counts.critical + counts.serious + counts.moderate + counts.minor || 1;

  const segments = [
    {
      key: "critical",
      value: counts.critical,
      className: "bg-[color:var(--critical)]",
    },
    {
      key: "serious",
      value: counts.serious,
      className: "bg-[color:var(--serious)]",
    },
    {
      key: "moderate",
      value: counts.moderate,
      className: "bg-[color:var(--moderate)]",
    },
    {
      key: "minor",
      value: counts.minor,
      className: "bg-[color:var(--minor)]",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-2 w-full overflow-hidden rounded-full bg-surface-2",
        className
      )}
    >
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={segment.className}
          style={{ width: `${(segment.value / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

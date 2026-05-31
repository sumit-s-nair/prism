import type { SeverityCounts } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeverityBarProps {
  counts: SeverityCounts;
  className?: string;
}

export function SeverityBar({ counts, className }: SeverityBarProps) {
  const total =
    counts.critical + counts.serious + counts.moderate + counts.minor;

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

  const columnTemplate = segments
    .map((segment) => (segment.value > 0 ? `${segment.value}fr` : "0fr"))
    .join(" ");

  return (
    <div
      className={cn(
        "grid h-2 w-full overflow-hidden rounded-full bg-surface-2",
        className
      )}
      style={total > 0 ? { gridTemplateColumns: columnTemplate } : undefined}
    >
      {total > 0
        ? segments.map((segment) => (
            <div key={segment.key} className={cn("h-full", segment.className)} />
          ))
        : null}
    </div>
  );
}

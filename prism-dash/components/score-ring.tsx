"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({
  score,
  size = 200,
  strokeWidth = 12,
  className,
}: ScoreRingProps) {
  const safeScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = React.useState(circumference);

  React.useEffect(() => {
    const target = circumference - (safeScore / 100) * circumference;
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [circumference, safeScore]);

  const tone =
    safeScore >= 80
      ? "text-emerald-400"
      : safeScore >= 50
        ? "text-amber-400"
        : "text-rose-500";

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-[color:var(--surface-2)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-1000", tone)}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-semibold text-foreground">
            {safeScore}
          </p>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
            score
          </p>
        </div>
      </div>
    </div>
  );
}

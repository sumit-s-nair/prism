import { Badge } from "@/components/ui/badge";
import type { AuditMode } from "@/lib/types";

interface ModeBadgeProps {
  mode: AuditMode;
  className?: string;
}

export function ModeBadge({ mode, className }: ModeBadgeProps) {
  return (
    <Badge variant="mode" className={className}>
      {mode === "proxy" ? "proxy" : "on-demand"}
    </Badge>
  );
}

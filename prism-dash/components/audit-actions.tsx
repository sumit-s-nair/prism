"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { startAudit, getErrorMessage } from "@/lib/api";

interface AuditActionsProps {
  url: string;
}

export function AuditActions({ url }: AuditActionsProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAuditAgain = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const result = await startAudit(url);
      router.push(`/audit/${result.auditId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAuditAgain} disabled={isRunning}>
          {isRunning ? "Re-running..." : "Audit again"}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/history?url=${encodeURIComponent(url)}`}>
            View history
          </Link>
        </Button>
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}

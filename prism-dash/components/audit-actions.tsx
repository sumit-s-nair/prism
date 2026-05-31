"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AuditActionsProps {
  url: string;
}

export function AuditActions({ url }: AuditActionsProps) {
  const router = useRouter();

  const handleAuditAgain = () => {
    router.push(`/?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAuditAgain}>Audit again</Button>
        <Button asChild variant="outline">
          <Link href={`/history?url=${encodeURIComponent(url)}`}>
            View history
          </Link>
        </Button>
      </div>
    </div>
  );
}

import { ErrorState } from "@/components/error-state";
import { HistoryClient } from "@/components/history-client";
import { getErrorMessage, getRecentAudits } from "@/lib/api";
import type { AuditSummary } from "@/lib/types";

interface HistoryPageProps {
  searchParams?: { url?: string } | Promise<{ url?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const initialUrl =
    typeof resolvedSearchParams?.url === "string"
      ? resolvedSearchParams.url
      : undefined;
  let audits: AuditSummary[] = [];
  let errorMessage: string | null = null;

  try {
    audits = await getRecentAudits();
  } catch (error) {
    errorMessage = getErrorMessage(error);
  }

  if (errorMessage) {
    return (
      <ErrorState
        title="History unavailable"
        message={errorMessage}
        actionLabel="Back to dashboard"
        actionHref="/"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
            Audit history
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Historical runs
          </h1>
          <p className="text-sm text-muted-2">
            Filter the most recent audits across URLs, scores, and modes.
          </p>
        </div>
      </div>
      <HistoryClient audits={audits} initialUrl={initialUrl} />
    </div>
  );
}

import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { ModeBadge } from "@/components/mode-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuditsByUrl, getErrorMessage, getRecentAudits } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import type { AuditSummary } from "@/lib/types";

interface HistoryPageProps {
  searchParams?: { url?: string } | Promise<{ url?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const filterUrl =
    typeof resolvedSearchParams?.url === "string"
      ? resolvedSearchParams.url
      : undefined;
  let audits: AuditSummary[] = [];
  let errorMessage: string | null = null;

  try {
    audits = filterUrl ? await getAuditsByUrl(filterUrl) : await getRecentAudits();
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
          <p className="break-all text-sm text-muted-2">
            {filterUrl
              ? `Showing audits for ${filterUrl}`
              : "Showing the most recent audits across all URLs."}
          </p>
        </div>
        {filterUrl ? (
          <Link
            href="/history"
            className="text-xs font-mono uppercase tracking-[0.2em] text-muted transition hover:text-foreground"
          >
            Clear filter
          </Link>
        ) : null}
      </div>

      {audits.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-2">
            No audits recorded yet. Run an audit from the dashboard.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit) => {
                const scoreTone =
                  audit.score >= 80
                    ? "text-emerald-400"
                    : audit.score >= 50
                      ? "text-amber-400"
                      : "text-rose-500";

                return (
                  <TableRow key={audit.auditId}>
                    <TableCell className="max-w-[320px]">
                      <Link
                        href={`/audit/${audit.auditId}`}
                        className="block truncate text-sm text-foreground transition hover:text-[color:var(--accent)]"
                      >
                        {audit.url}
                      </Link>
                    </TableCell>
                    <TableCell className={scoreTone}>{audit.score}</TableCell>
                    <TableCell>{audit.totalIssues}</TableCell>
                    <TableCell>
                      <ModeBadge mode={audit.mode} />
                    </TableCell>
                    <TableCell>{formatTimestamp(audit.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

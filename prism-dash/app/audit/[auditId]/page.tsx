import { AuditActions } from "@/components/audit-actions";
import { ErrorState } from "@/components/error-state";
import { IssuesAccordion } from "@/components/issues-accordion";
import { ModeBadge } from "@/components/mode-badge";
import { ScoreRing } from "@/components/score-ring";
import { SeverityBar } from "@/components/severity-bar";
import { Card } from "@/components/ui/card";
import { ApiError, getAuditById, getErrorMessage } from "@/lib/api";
import { getSeverityCounts } from "@/lib/audit";
import { formatTimestamp } from "@/lib/format";

interface AuditPageProps {
  params: { auditId: string } | Promise<{ auditId: string }>;
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { auditId } = await Promise.resolve(params);
  let errorMessage: string | null = null;
  let audit = null;

  try {
    audit = await getAuditById(auditId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      errorMessage = "Audit not found for the supplied ID.";
    } else {
      errorMessage = getErrorMessage(error);
    }
  }

  if (!audit) {
    return (
      <ErrorState
        title="Audit unavailable"
        message={errorMessage ?? "Unable to load audit data."}
      />
    );
  }

  const counts = getSeverityCounts(audit.issues);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
            Audit result
          </p>
          <h1 className="break-all text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {audit.url}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted">
            <ModeBadge mode={audit.mode} className="text-xs" />
            <span>Audit ID</span>
            <span className="break-all text-foreground">{audit.auditId}</span>
            <span>Time</span>
            <span className="text-foreground">
              {formatTimestamp(audit.createdAt)}
            </span>
          </div>
        </div>
        <AuditActions url={audit.url} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center gap-6 p-6">
          <ScoreRing score={audit.score} size={200} />
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
              Total issues
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {audit.totalIssues}
            </p>
          </div>
        </Card>
        <Card className="space-y-6 p-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
              Severity breakdown
            </p>
            <p className="text-sm text-muted-2">
              Distribution across criticality buckets.
            </p>
          </div>
          <SeverityBar counts={counts} />
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              {
                label: "Critical",
                value: counts.critical,
                color: "bg-[color:var(--critical)]",
              },
              {
                label: "Serious",
                value: counts.serious,
                color: "bg-[color:var(--serious)]",
              },
              {
                label: "Moderate",
                value: counts.moderate,
                color: "bg-[color:var(--moderate)]",
              },
              {
                label: "Minor",
                value: counts.minor,
                color: "bg-[color:var(--minor)]",
              },
            ] as const).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-subtle bg-surface-2 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
              Issues
            </p>
            <p className="text-sm text-muted-2">
              Grouped by rule type with element snippets.
            </p>
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
            {audit.totalIssues} total
          </span>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          <IssuesAccordion issues={audit.issues} />
        </div>
      </Card>
    </div>
  );
}

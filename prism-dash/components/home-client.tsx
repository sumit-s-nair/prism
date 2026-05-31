"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { startAudit, getErrorMessage } from "@/lib/api";
import type { AuditSummary } from "@/lib/types";
import { formatTimestamp } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeBadge } from "@/components/mode-badge";
import { cn } from "@/lib/utils";

interface HomeClientProps {
  initialAudits: AuditSummary[];
  initialError?: string | null;
}

export function HomeClient({ initialAudits, initialError }: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = React.useState("");
  const audits = initialAudits;
  const [formError, setFormError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const prefillUrl = searchParams.get("url");

  React.useEffect(() => {
    if (!prefillUrl) {
      return;
    }

    setUrl((current) => (current ? current : prefillUrl));
  }, [prefillUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setFormError("Enter a URL to audit.");
      return;
    }

    setFormError(null);
    setStatus("Scheduling audit...");
    setIsSubmitting(true);

    try {
      const result = await startAudit(trimmed);
      router.push(`/audit/${result.auditId}`);
    } catch (err) {
      setFormError(getErrorMessage(err));
      setStatus(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <section className="mx-auto w-full max-w-6xl px-6 pt-16">
        <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Edge-native</Badge>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-muted">
              Prism Audit Console
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Launch accessibility audits from the edge.
          </h1>
          <p className="text-base text-muted-2 sm:text-lg">
            Prism runs Lighthouse-inspired checks directly on Cloudflare Workers.
            Validate contrast, semantics, and structure without leaving your
            workflow.
          </p>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Label htmlFor="audit-url">Target URL</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="audit-url"
                name="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={isSubmitting}
                required
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Running audit..." : "Run audit"}
              </Button>
            </div>
            {formError ? (
              <p className="text-sm text-rose-400">{formError}</p>
            ) : (
              <p className="text-xs text-muted">
                Results typically return in under 10 seconds.
              </p>
            )}
            {status ? (
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                {status}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-6xl space-y-6 px-6 animate-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
              Recent audits
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Latest edge runs
            </h2>
          </div>
          <Link
            href="/history"
            className="text-xs font-mono uppercase tracking-[0.2em] text-muted transition hover:text-foreground"
          >
            View all
          </Link>
        </div>

        {initialError ? (
          <Card className="p-6">
            <p className="text-sm text-rose-400">{initialError}</p>
          </Card>
        ) : audits.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-2">
              No audits yet. Run your first audit above.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {audits.map((audit) => {
              const scoreTone =
                audit.score >= 80
                  ? "text-emerald-400"
                  : audit.score >= 50
                    ? "text-amber-400"
                    : "text-rose-500";

              return (
                <Link
                  key={audit.auditId}
                  href={`/audit/${audit.auditId}`}
                  className="group"
                >
                  <Card className="p-5 transition group-hover:border-[color:var(--accent)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                          Target
                        </p>
                        <p className="mt-1 max-w-[320px] truncate text-sm text-foreground">
                          {audit.url}
                        </p>
                      </div>
                      <ModeBadge mode={audit.mode} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted">
                      <div>
                        <p>Score</p>
                        <p className={cn("mt-1 text-sm font-semibold", scoreTone)}>
                          {audit.score}
                        </p>
                      </div>
                      <div>
                        <p>Issues</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {audit.totalIssues}
                        </p>
                      </div>
                      <div>
                        <p>Time</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatTimestamp(audit.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

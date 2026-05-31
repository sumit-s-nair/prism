"use client";

import Link from "next/link";
import * as React from "react";
import { ModeBadge } from "@/components/mode-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTimestamp } from "@/lib/format";
import type { AuditMode, AuditSummary } from "@/lib/types";

interface HistoryClientProps {
  audits: AuditSummary[];
  initialUrl?: string;
}

type ScoreFilter = "all" | "good" | "warning" | "poor";

type ModeFilter = "all" | AuditMode;

const selectClassName =
  "h-11 w-full min-w-0 rounded-md border border-border bg-surface-2 px-3 text-sm font-mono text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

export function HistoryClient({ audits, initialUrl }: HistoryClientProps) {
  const [search, setSearch] = React.useState(initialUrl ?? "");
  const [scoreFilter, setScoreFilter] = React.useState<ScoreFilter>("all");
  const [modeFilter, setModeFilter] = React.useState<ModeFilter>("all");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredAudits = React.useMemo(() => {
    return audits.filter((audit) => {
      if (
        normalizedSearch &&
        !audit.url.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (scoreFilter === "good" && audit.score < 80) {
        return false;
      }

      if (
        scoreFilter === "warning" &&
        (audit.score < 50 || audit.score > 79)
      ) {
        return false;
      }

      if (scoreFilter === "poor" && audit.score >= 50) {
        return false;
      }

      if (modeFilter !== "all" && audit.mode !== modeFilter) {
        return false;
      }

      return true;
    });
  }, [audits, modeFilter, normalizedSearch, scoreFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setScoreFilter("all");
    setModeFilter("all");
  };

  const filteredCount = filteredAudits.length;
  const totalCount = audits.length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="history-search">Search URL</Label>
            <Input
              id="history-search"
              name="search"
              type="text"
              placeholder="Filter by URL"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score-filter">Score</Label>
            <select
              id="score-filter"
              name="score-filter"
              className={selectClassName}
              value={scoreFilter}
              onChange={(event) =>
                setScoreFilter(event.target.value as ScoreFilter)
              }
            >
              <option value="all">All</option>
              <option value="good">Good (80-100)</option>
              <option value="warning">Warning (50-79)</option>
              <option value="poor">Poor (0-49)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode-filter">Mode</Label>
            <select
              id="mode-filter"
              name="mode-filter"
              className={selectClassName}
              value={modeFilter}
              onChange={(event) =>
                setModeFilter(event.target.value as ModeFilter)
              }
            >
              <option value="all">All</option>
              <option value="on-demand">On-demand</option>
              <option value="proxy">Proxy</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
            Showing {filteredCount} of {totalCount} audits
          </p>
        </div>
      </Card>

      {totalCount === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-2">
            No audits recorded yet. Run an audit from the dashboard.
          </p>
        </Card>
      ) : filteredCount === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-2">
            No audits match the current filters.
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
              {filteredAudits.map((audit) => {
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

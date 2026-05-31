"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { groupIssuesByType } from "@/lib/audit";
import type { AuditIssue, Severity } from "@/lib/types";

interface IssuesAccordionProps {
  issues: AuditIssue[];
}

function severityVariant(severity: Severity) {
  switch (severity) {
    case "critical":
      return "critical";
    case "serious":
      return "serious";
    case "moderate":
      return "moderate";
    case "minor":
      return "minor";
    default:
      return "outline";
  }
}

export function IssuesAccordion({ issues }: IssuesAccordionProps) {
  const groups = React.useMemo(() => groupIssuesByType(issues), [issues]);
  const defaultValue = groups.slice(0, 1).map((group) => group.type);

  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-subtle bg-surface-2 p-6 text-sm text-muted-2">
        No accessibility issues detected. This audit is clean.
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={defaultValue}>
      {groups.map((group) => (
        <AccordionItem key={group.type} value={group.type}>
          <AccordionTrigger>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {group.type}
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                {group.items.length} issue{group.items.length === 1 ? "" : "s"}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {group.items.map((issue, index) => (
                <div
                  key={issue.id ?? `${group.type}-${index}`}
                  className="rounded-lg border border-subtle bg-surface-2 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={severityVariant(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    {issue.element ? (
                      <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                        Element
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-foreground">{issue.message}</p>
                  {issue.element ? (
                    <pre className="mt-3 overflow-x-auto rounded-md border border-subtle bg-black/30 p-3 text-xs text-muted-2">
                      <code className="font-mono">{issue.element}</code>
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

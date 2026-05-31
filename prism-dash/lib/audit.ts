import type { AuditIssue, SeverityCounts } from "@/lib/types";

export function getSeverityCounts(issues: AuditIssue[]): SeverityCounts {
  return issues.reduce(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { critical: 0, serious: 0, moderate: 0, minor: 0 }
  );
}

export function groupIssuesByType(issues: AuditIssue[]) {
  const groups = new Map<string, AuditIssue[]>();

  for (const issue of issues) {
    const existing = groups.get(issue.type) ?? [];
    existing.push(issue);
    groups.set(issue.type, existing);
  }

  return Array.from(groups.entries())
    .map(([type, items]) => ({ type, items }))
    .sort((a, b) => b.items.length - a.items.length);
}

export type Severity = "critical" | "serious" | "moderate" | "minor";
export type AuditMode = "on-demand" | "proxy";

export interface AuditIssue {
  id?: string;
  type: string;
  severity: Severity;
  element?: string | null;
  message: string;
}

export interface AuditRecord {
  auditId: string;
  url: string;
  score: number;
  totalIssues: number;
  issues: AuditIssue[];
  mode: AuditMode;
  createdAt: number;
  cached?: boolean;
}

export interface AuditSummary {
  auditId: string;
  url: string;
  score: number;
  totalIssues: number;
  mode: AuditMode;
  createdAt: number;
}

export interface SeverityCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface AuditIssue {
    type: string;
    severity: Severity;
    element?: string;
    message: string;
}

export interface AuditResult {
    url: string;
    score: number;
    totalIssues: number;
    issues: AuditIssue[];
    mode: "on-demand" | "proxy";
    createdAt: number;
}
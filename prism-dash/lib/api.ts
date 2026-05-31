import type { AuditIssue, AuditMode, AuditRecord, AuditSummary } from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_PRISM_API_BASE_URL ??
  "https://prism-worker.prism-audit.workers.dev";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function normalizeIssues(
  issues: AuditIssue[] | string | null | undefined
): AuditIssue[] {
  if (!issues) return [];

  const parsed = (() => {
    if (typeof issues === "string") {
      try {
        return JSON.parse(issues) as AuditIssue[];
      } catch {
        return [];
      }
    }
    return issues;
  })();

  return parsed.filter(
    (issue) =>
      Boolean(issue?.type) &&
      Boolean(issue?.severity) &&
      Boolean(issue?.message)
  );
}

function normalizeSummary(entry: {
  id: string;
  url: string;
  mode: AuditMode;
  score: number;
  total_issues: number;
  created_at: number;
}): AuditSummary {
  return {
    auditId: entry.id,
    url: entry.url,
    mode: entry.mode,
    score: entry.score,
    totalIssues: entry.total_issues,
    createdAt: entry.created_at,
  };
}

function normalizeRecordFromDb(entry: {
  id: string;
  url: string;
  mode: AuditMode;
  score: number;
  total_issues: number;
  created_at: number;
  issues?: AuditIssue[] | string | null;
}): AuditRecord {
  return {
    auditId: entry.id,
    url: entry.url,
    mode: entry.mode,
    score: entry.score,
    totalIssues: entry.total_issues,
    createdAt: entry.created_at,
    issues: normalizeIssues(entry.issues),
  };
}

function normalizeRecordFromOnDemand(entry: {
  auditId: string;
  url: string;
  mode: AuditMode;
  score: number;
  totalIssues: number;
  createdAt: number;
  issues: AuditIssue[];
  cached?: boolean;
}): AuditRecord {
  return {
    auditId: entry.auditId,
    url: entry.url,
    mode: entry.mode,
    score: entry.score,
    totalIssues: entry.totalIssues,
    createdAt: entry.createdAt,
    issues: entry.issues ?? [],
    cached: entry.cached,
  };
}

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error: string }).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export async function getRecentAudits(): Promise<AuditSummary[]> {
  const data = await fetchJson<
    {
      id: string;
      url: string;
      mode: AuditMode;
      score: number;
      total_issues: number;
      created_at: number;
    }[]
  >(`${API_BASE_URL}/results`, { cache: "no-store" });

  return data.map(normalizeSummary);
}

export async function getAuditById(auditId: string): Promise<AuditRecord> {
  const data = await fetchJson<{
    id: string;
    url: string;
    mode: AuditMode;
    score: number;
    total_issues: number;
    created_at: number;
    issues?: AuditIssue[] | string | null;
  }>(`${API_BASE_URL}/results?auditId=${encodeURIComponent(auditId)}`, {
    cache: "no-store",
  });

  return normalizeRecordFromDb(data);
}

export async function getAuditsByUrl(url: string): Promise<AuditSummary[]> {
  const data = await fetchJson<
    {
      id: string;
      url: string;
      mode: AuditMode;
      score: number;
      total_issues: number;
      created_at: number;
    }[]
  >(`${API_BASE_URL}/results?url=${encodeURIComponent(url)}`, {
    cache: "no-store",
  });

  return data.map(normalizeSummary);
}

export async function startAudit(url: string): Promise<AuditRecord> {
  const data = await fetchJson<{
    auditId: string;
    url: string;
    mode: AuditMode;
    score: number;
    totalIssues: number;
    createdAt: number;
    issues: AuditIssue[];
    cached?: boolean;
  }>(`${API_BASE_URL}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return normalizeRecordFromOnDemand(data);
}

import { HomeClient } from "@/components/home-client";
import { getErrorMessage, getRecentAudits } from "@/lib/api";
import type { AuditSummary } from "@/lib/types";

export default async function HomePage() {
  let recentAudits: AuditSummary[] = [];
  let recentError: string | null = null;

  try {
    recentAudits = await getRecentAudits();
  } catch (error) {
    recentError = getErrorMessage(error);
  }

  return (
    <HomeClient initialAudits={recentAudits} initialError={recentError} />
  );
}

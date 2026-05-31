import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function ErrorState({
  title,
  message,
  actionLabel = "Back to dashboard",
  actionHref = "/",
}: ErrorStateProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Card className="p-6">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
          Prism status
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-sm text-muted-2">{message}</p>
        <div className="mt-6">
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

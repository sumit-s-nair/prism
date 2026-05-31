import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              Prism
            </Link>
            <p className="text-xs font-mono text-muted">
              Edge-native accessibility auditor
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em]">
          <Link href="/" className="text-muted transition hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/history"
            className="text-muted transition hover:text-foreground"
          >
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}

CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('on-demand', 'proxy')),
    score INTEGER NOT NULL,
    total_issues INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    audit_id TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'serious', 'moderate', 'minor')),
    element TEXT,
    message TEXT NOT NULL,
    FOREIGN KEY (audit_id) REFERENCES audits(id)
);

CREATE INDEX IF NOT EXISTS idx_audits_url ON audits(url);
CREATE INDEX IF NOT EXISTS idx_issues_audit_id ON issues(audit_id);
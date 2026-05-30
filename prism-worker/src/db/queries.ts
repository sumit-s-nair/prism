import { AuditResult, AuditIssue } from "../auditor/types";

function generateId(): string {
    return crypto.randomUUID();
}

export async function saveAudit(
    db: D1Database,
    result: AuditResult
): Promise<string> {
    const auditId = generateId();

    await db
        .prepare(
            `INSERT INTO audits (id, url, mode, score, total_issues, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
            auditId,
            result.url,
            result.mode,
            result.score,
            result.totalIssues,
            result.createdAt
        )
        .run();

    if (result.issues.length > 0) {
        const issueInserts = result.issues.map((issue: AuditIssue) =>
            db
                .prepare(
                    `INSERT INTO issues (id, audit_id, type, severity, element, message)
                     VALUES (?, ?, ?, ?, ?, ?)`
                )
                .bind(
                    generateId(),
                    auditId,
                    issue.type,
                    issue.severity,
                    issue.element ?? null,
                    issue.message
                )
        );

        await db.batch(issueInserts);
    }

    return auditId;
}

export async function getAuditsByUrl(
    db: D1Database,
    url: string,
    limit = 10
): Promise<any[]> {
    const result = await db
        .prepare(
            `SELECT a.*, json_group_array(
                json_object(
                    'id', i.id,
                    'type', i.type,
                    'severity', i.severity,
                    'element', i.element,
                    'message', i.message
                )
            ) as issues
            FROM audits a
            LEFT JOIN issues i ON i.audit_id = a.id
            WHERE a.url = ?
            GROUP BY a.id
            ORDER BY a.created_at DESC
            LIMIT ?`
        )
        .bind(url, limit)
        .all();

    return result.results;
}

export async function getAuditById(
    db: D1Database,
    auditId: string
): Promise<any | null> {
    const result = await db
        .prepare(
            `SELECT a.*, json_group_array(
                json_object(
                    'id', i.id,
                    'type', i.type,
                    'severity', i.severity,
                    'element', i.element,
                    'message', i.message
                )
            ) as issues
            FROM audits a
            LEFT JOIN issues i ON i.audit_id = a.id
            WHERE a.id = ?
            GROUP BY a.id`
        )
        .bind(auditId)
        .first();

    return result ?? null;
}

export async function getRecentAudits(
    db: D1Database,
    limit = 20
): Promise<any[]> {
    const result = await db
        .prepare(
            `SELECT id, url, mode, score, total_issues, created_at
             FROM audits
             ORDER BY created_at DESC
             LIMIT ?`
        )
        .bind(limit)
        .all();

    return result.results;
}
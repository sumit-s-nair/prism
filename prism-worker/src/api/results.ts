import { getAuditById, getAuditsByUrl, getRecentAudits } from "../db/queries";

export async function handleGetResults(
    request: Request,
    env: Env
): Promise<Response> {
    const url = new URL(request.url);
    const auditId = url.searchParams.get("auditId");
    const targetUrl = url.searchParams.get("url");

    try {
        if (auditId) {
            const audit = await getAuditById(env.DB, auditId);
            if (!audit) {
                return new Response(
                    JSON.stringify({ error: "Audit not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
            return new Response(JSON.stringify(audit), {
                headers: { "Content-Type": "application/json" },
            });
        }

        if (targetUrl) {
            const audits = await getAuditsByUrl(env.DB, targetUrl);
            return new Response(JSON.stringify(audits), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const recent = await getRecentAudits(env.DB);
        return new Response(JSON.stringify(recent), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({
                error: `Failed to fetch results: ${(err as Error).message}`,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
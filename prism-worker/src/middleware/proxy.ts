import { auditUrl } from "../auditor";
import { saveAudit } from "../db/queries";

export async function handleProxy(
    request: Request,
    env: Env
): Promise<Response> {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("target");

    if (!targetUrl) {
        return new Response(
            JSON.stringify({ error: "Missing target URL parameter" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // Check cache first
    const cacheKey = `proxy:${targetUrl}`;
    const cached = await env.CACHE.get(cacheKey, "json");
    if (cached) {
        return new Response(JSON.stringify({ cached: true, ...cached as object }), {
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const result = await auditUrl(targetUrl, "proxy");
        const auditId = await saveAudit(env.DB, result);

        const response = { auditId, ...result };

        // Cache for 5 minutes
        await env.CACHE.put(cacheKey, JSON.stringify(response), {
            expirationTtl: 300,
        });

        return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: `Failed to audit target: ${(err as Error).message}` }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
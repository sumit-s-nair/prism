import { auditUrl } from "../auditor";
import { saveAudit } from "../db/queries";
import { checkRateLimit } from "../middleware/ratelimit";

export async function handleOnDemandAudit(
    request: Request,
    env: Env
): Promise<Response> {
    const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for") ??
        "unknown";

    const rateLimit = await checkRateLimit(env.RATE_LIMIT, ip);

    if (!rateLimit.allowed) {
        return new Response(
            JSON.stringify({
                error: "Rate limit exceeded. Max 10 requests per minute.",
                resetAt: rateLimit.resetAt,
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(rateLimit.resetAt),
                },
            }
        );
    }

    let body: { url?: string };
    try {
        body = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON body" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    if (!body.url) {
        return new Response(
            JSON.stringify({ error: "Missing url in request body" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // Validate URL
    try {
        new URL(body.url);
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid URL provided" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // Check cache
    const cacheKey = `audit:${body.url}`;
    const cached = await env.CACHE.get(cacheKey, "json");
    if (cached) {
        return new Response(
            JSON.stringify({ cached: true, ...cached as object }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Remaining": String(rateLimit.remaining),
                },
            }
        );
    }

    try {
        const result = await auditUrl(body.url, "on-demand");
        const auditId = await saveAudit(env.DB, result);
        const response = { auditId, ...result };

        // Cache for 5 minutes
        await env.CACHE.put(cacheKey, JSON.stringify(response), {
            expirationTtl: 300,
        });

        return new Response(JSON.stringify(response), {
            headers: {
                "Content-Type": "application/json",
                "X-RateLimit-Remaining": String(rateLimit.remaining),
            },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({
                error: `Audit failed: ${(err as Error).message}`,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
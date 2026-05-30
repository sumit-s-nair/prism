const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export async function checkRateLimit(
    kv: KVNamespace,
    ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `rate:${ip}`;
    const now = Date.now();
    const resetAt = now + WINDOW_MS;

    const existing = await kv.get(key, "json") as {
        count: number;
        resetAt: number;
    } | null;

    if (!existing || now > existing.resetAt) {
        await kv.put(key, JSON.stringify({ count: 1, resetAt }), {
            expirationTtl: 60,
        });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
    }

    if (existing.count >= MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    await kv.put(
        key,
        JSON.stringify({ count: existing.count + 1, resetAt: existing.resetAt }),
        { expirationTtl: 60 }
    );

    return {
        allowed: true,
        remaining: MAX_REQUESTS - existing.count - 1,
        resetAt: existing.resetAt,
    };
}
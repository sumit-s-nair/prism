import { handleOnDemandAudit } from "./api/audit";
import { handleGetResults } from "./api/results";
import { handleProxy } from "./middleware/proxy";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: CORS_HEADERS });
        }

        try {
            // Route requests
            if (url.pathname === "/audit" && request.method === "POST") {
                const response = await handleOnDemandAudit(request, env);
                return addCors(response);
            }

            if (url.pathname === "/results" && request.method === "GET") {
                const response = await handleGetResults(request, env);
                return addCors(response);
            }

            if (url.pathname === "/proxy" && request.method === "GET") {
                const response = await handleProxy(request, env);
                return addCors(response);
            }

            if (url.pathname === "/health" && request.method === "GET") {
                return addCors(
                    new Response(
                        JSON.stringify({ status: "ok", service: "prism" }),
                        { headers: { "Content-Type": "application/json" } }
                    )
                );
            }

            return addCors(
                new Response(
                    JSON.stringify({ error: "Not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    }
                )
            );
        } catch (err) {
            return addCors(
                new Response(
                    JSON.stringify({
                        error: `Internal server error: ${(err as Error).message}`,
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                )
            );
        }
    },
};

function addCors(response: Response): Response {
    const newResponse = new Response(response.body, response);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
    });
    return newResponse;
}
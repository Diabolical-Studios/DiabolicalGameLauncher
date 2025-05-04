// GET /external-subs
// CORS pre-flight:  OPTIONS /external-subs
// ───────────────────────────────────────────
export default async (request, context) => {
    console.log("=== Edge Function ▸ external-subs ===");
    console.log(
        "Received Headers:",
        JSON.stringify(Object.fromEntries(request.headers), null, 2)
    );

    /* ───────────────────────
     * 0.  Handle CORS
     * ─────────────────────── */
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
        });
    }

    /* ────────────────────────────────────────
     * 1.  Extract sessionId from request headers
     *     (header name:  SessionID  / sessionid )
     * ──────────────────────────────────────── */
    const headersLower = {};
    for (const [k, v] of request.headers.entries()) headersLower[k.toLowerCase()] = v;

    const sessionId = headersLower["sessionid"];
    console.log("Extracted sessionId:", sessionId);

    if (!sessionId) {
        return new Response(
            JSON.stringify({ error: "Unauthorized: No valid session ID" }),
            { status: 401, headers: { "content-type": "application/json" } }
        );
    }

    /* ────────────────────────────────────────
     * 2.  Proxy call to REST API
     * ──────────────────────────────────────── */
    const apiBaseUrl = Netlify.env.get("API_BASE_URL");
    const apiKey     = Netlify.env.get("API_KEY");

    if (!apiBaseUrl || !apiKey) {
        console.error("API configuration missing");
        return new Response(JSON.stringify({ error: "API configuration missing" }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }

    const apiURL = `${apiBaseUrl}/rest-api/subscriptions/external/${sessionId}`;
    console.log("Proxying to:", apiURL);

    const apiRes = await fetch(apiURL, {
        headers: { "x-api-key": apiKey },
    });

    /* ────────────────────────────────────────
     * 3.  Stream result back to client
     * ──────────────────────────────────────── */
    return new Response(apiRes.body, {
        status: apiRes.status,
        headers: {
            "content-type": apiRes.headers.get("content-type") || "application/json",
            "cache-control": "no-store",
        },
    });
};

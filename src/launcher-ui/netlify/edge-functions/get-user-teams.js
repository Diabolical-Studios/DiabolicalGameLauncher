export default async (request, context) => {
    console.log("=== Edge Function: Get User Teams Triggered ===");
    console.log("Received Headers:", JSON.stringify(Object.fromEntries(request.headers), null, 2));

    // Normalize headers to lower-case keys
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
        headers[key.toLowerCase()] = value;
    }
    const sessionID = headers["sessionid"];
    console.log("Extracted sessionID:", sessionID);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    // Only allow GET requests
    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
        });
    }

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return new Response(JSON.stringify({ error: "Unauthorized: No valid session ID" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    try {
        console.log("✅ Fetching teams from API...");

        const apiRes = await fetch(`${globalThis.ENV.API_BASE_URL}/rest-api/teams/session/${sessionID}`, {
            headers: {
                "x-api-key": globalThis.ENV.API_KEY,
            },
        });

        if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error("❌ API Response Error:", errorText);
            return new Response(JSON.stringify({ error: errorText }), {
                status: apiRes.status,
                headers: { "content-type": "application/json" },
            });
        }

        const data = await apiRes.json();
        console.log("✅ API Response:", data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Fetch Error:", error.response?.data || error.message);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};

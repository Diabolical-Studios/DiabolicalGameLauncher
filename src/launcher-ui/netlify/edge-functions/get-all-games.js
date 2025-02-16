export default async (request, context) => {
    console.log("=== Netlify Edge Function Triggered ===");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    // Only allow GET
    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
        });
    }

    try {
        const response = await fetch(`${globalThis.ENV.API_BASE_URL}/rest-api/games`, {
            headers: {
                "x-api-key": globalThis.ENV.API_KEY,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("❌ API Fetch Error:", errorBody);
            return new Response(JSON.stringify({ error: errorBody }), {
                status: response.status,
                headers: { "content-type": "application/json" },
            });
        }

        const data = await response.json();
        console.log("✅ API Response:", data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Fetch Error:", error.message);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};

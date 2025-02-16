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
        // Access environment variables using Netlify.env.get() for Deno
        const apiBaseUrl = Netlify.env.get("API_BASE_URL");
        const apiKey = Netlify.env.get("API_KEY");

        if (!apiBaseUrl || !apiKey) {
            console.error("❌ API configuration missing.");
            return new Response(
                JSON.stringify({ error: "API configuration missing." }),
                {
                    status: 500,
                    headers: { "content-type": "application/json" },
                }
            );
        }

        const response = await fetch(`${apiBaseUrl}/rest-api/games`, {
            headers: {
                "x-api-key": apiKey,
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

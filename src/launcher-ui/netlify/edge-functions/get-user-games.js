export default async (request, context) => {
    console.log("=== Netlify Edge Function Triggered ===");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    // Only allow GET requests
    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Extract the query parameter `team_name` from the URL
    const url = new URL(request.url);
    const teamName = url.searchParams.get("team_name");

    if (!teamName) {
        console.error("❌ Missing team_name in request.");
        return new Response(JSON.stringify({ error: "Missing team_name parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        console.log(`🎯 Fetching games for team: ${teamName}`);

        // Fetch the API using the environment variables
        const apiBaseUrl = Netlify.env.get("API_BASE_URL");
        const apiKey = Netlify.env.get("API_KEY");

        if (!apiBaseUrl || !apiKey) {
            console.error("❌ API configuration missing.");
            return new Response(JSON.stringify({ error: "API configuration missing." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const response = await fetch(
            `${apiBaseUrl}/rest-api/games/team/${encodeURIComponent(teamName)}`,
            {
                headers: { "x-api-key": apiKey },
            }
        );

        // Check if the response is okay
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API Fetch Error:", errorText);
            return new Response(JSON.stringify({ error: errorText }), {
                status: response.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Parse the response data and send it back to the client
        const data = await response.json();
        console.log("✅ API Response:", data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Fetch Error:", error);

        return new Response(
            JSON.stringify({ error: error.message || "Internal Server Error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

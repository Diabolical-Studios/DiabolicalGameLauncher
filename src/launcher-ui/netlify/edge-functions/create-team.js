export default async (request, context) => {
    console.log("=== Netlify Edge Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(Object.fromEntries(request.headers), null, 2));

    // Normalize headers to lowercase keys
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

    // Only allow POST
    if (request.method !== "POST") {
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

    // Parse the request body
    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error("❌ Invalid JSON body:", error);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    const { team_name, team_icon_url } = body;
    if (!team_name) {
        return new Response(JSON.stringify({ error: "Missing team_name" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }
    if (!team_icon_url) {
        return new Response(JSON.stringify({ error: "Missing team_icon_url" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    try {
        console.log("✅ Sending request to create team...");
        const createTeamRes = await fetch(`${globalThis.ENV.API_BASE_URL}/rest-api/teams`, {
            method: "POST",
            headers: {
                "x-api-key": globalThis.ENV.API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionID, team_name, team_icon_url }),
        });

        if (!createTeamRes.ok) {
            const errorBody = await createTeamRes.text();
            console.error("❌ API Error:", errorBody);
            return new Response(JSON.stringify({ error: errorBody }), {
                status: createTeamRes.status,
                headers: { "content-type": "application/json" },
            });
        }

        const data = await createTeamRes.json();
        console.log("✅ Team and membership created successfully:", data);

        return new Response(JSON.stringify(data), {
            status: 201,
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
};

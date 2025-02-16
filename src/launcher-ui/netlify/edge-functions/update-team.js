export default async (request, context) => {
    console.log("=== Netlify Edge Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(Object.fromEntries(request.headers), null, 2));

    // Normalize headers to lowercase keys
    const headersObj = {};
    for (const [key, value] of request.headers.entries()) {
        headersObj[key.toLowerCase()] = value;
    }
    const sessionID = headersObj["sessionid"];
    console.log("Extracted sessionID:", sessionID);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    if (request.method !== "PUT") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    let teamData;
    try {
        teamData = await request.json();
    } catch (error) {
        console.error("❌ Invalid JSON body:", error);
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!teamData.team_id || !teamData.team_name || !teamData.team_icon_url) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        console.log("✅ Sending request to update team...");
        const apiRes = await fetch(`${globalThis.ENV.API_BASE_URL}/rest-api/teams`, {
            method: "PUT",
            headers: {
                "x-api-key": globalThis.ENV.API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(teamData),
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            console.error("❌ API Error:", errText);
            return new Response(JSON.stringify({ error: errText }), {
                status: apiRes.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        const responseData = await apiRes.json();
        console.log("✅ Team updated successfully:", responseData);

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

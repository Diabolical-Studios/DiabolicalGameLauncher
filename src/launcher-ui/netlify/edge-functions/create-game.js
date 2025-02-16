export default async (request, context) => {
    console.log("=== Netlify Edge Function Triggered ===");

    // Access environment variables via globalThis.ENV
    const API_BASE_URL = globalThis.ENV.API_BASE_URL;
    const API_KEY = globalThis.ENV.API_KEY;

    // Example: parse the "sessionid" header (case-insensitive in your original code)
    const sessionID = request.headers.get("sessionid");

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

    // Parse the request body
    let body;
    try {
        body = await request.json();
    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    const {
        game_name,
        game_id,
        team_name,
        description,
        background_image_url,
        version,
        team_icon_url,
        github_repo,
    } = body;

    if (!game_name || !game_id || !team_name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    if (!sessionID) {
        return new Response(JSON.stringify({ error: "Unauthorized: No session ID" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    try {
        // 1) Verify session -> get GitHub ID
        const githubIdRes = await fetch(`${API_BASE_URL}/rest-api/users/session/${sessionID}`, {
            headers: {
                "x-api-key": API_KEY,
            },
        });

        if (!githubIdRes.ok) {
            return new Response(JSON.stringify({ error: `Failed to verify session: ${githubIdRes.status}` }), {
                status: githubIdRes.status,
                headers: { "content-type": "application/json" },
            });
        }

        const { github_id: sessionGithubId } = await githubIdRes.json();
        if (!sessionGithubId) {
            return new Response(JSON.stringify({ error: "GitHub ID not found for session" }), {
                status: 404,
                headers: { "content-type": "application/json" },
            });
        }

        // 2) Create the game record
        const gameUploadRes = await fetch(`${API_BASE_URL}/rest-api/games`, {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                game_name,
                game_id,
                team_name,
                description,
                background_image_url,
                version,
                team_icon_url,
                github_repo,
            }),
        });

        if (!gameUploadRes.ok) {
            return new Response(
                JSON.stringify({ error: `Failed to create game: ${gameUploadRes.status}` }),
                {
                    status: gameUploadRes.status,
                    headers: { "content-type": "application/json" },
                }
            );
        }

        const gameData = await gameUploadRes.json();

        // 3) Return success
        return new Response(
            JSON.stringify({ message: "Game created successfully", game: gameData }),
            {
                status: 201,
                headers: { "content-type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Edge Function Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal Server Error" }),
            {
                status: 500,
                headers: { "content-type": "application/json" },
            }
        );
    }
};

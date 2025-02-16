export default async (request, context) => {
    console.log("=== verifySession Netlify Edge Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(Object.fromEntries(request.headers), null, 2));

    // Normalize headers to lowercase for easier access
    const headersObj = {};
    for (const [key, value] of request.headers.entries()) {
        headersObj[key.toLowerCase()] = value;
    }

    const sessionID = headersObj["sessionid"];
    console.log("Extracted sessionID:", sessionID);

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        return new Response("", { status: 200 });
    }

    if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return new Response(
            JSON.stringify({ error: "Unauthorized: No valid session ID" }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    try {
        console.log("✅ Sending request to backend to verify session...");
        const apiRes = await fetch(
            `${globalThis.ENV.API_BASE_URL}/rest-api/users/session/${sessionID}`,
            {
                headers: {
                    "x-api-key": globalThis.ENV.API_KEY,
                },
            }
        );

        if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error("❌ API Error:", errorText);
            return new Response(
                JSON.stringify({ error: errorText }),
                {
                    status: apiRes.status,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const responseData = await apiRes.json();
        console.log("✅ Backend response:", responseData);

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("❌ API Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Internal Server Error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};

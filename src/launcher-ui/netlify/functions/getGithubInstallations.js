const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(event.headers, null, 2));

    const headers = Object.keys(event.headers).reduce((acc, key) => {
        acc[key.toLowerCase()] = event.headers[key];
        return acc;
    }, {});

    const sessionID = headers["sessionid"];
    console.log("Extracted sessionID:", sessionID);

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, sessionID",
            },
            body: "",
        };
    }

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Unauthorized: No valid session ID" }),
        };
    }

    try {
        console.log("✅ Fetching GitHub installations from API...");
        const response = await axios.get(
            `${process.env.API_BASE_URL}/rest-api/users/installations/${sessionID}`,
            { headers: { "x-api-key": process.env.API_KEY } }
        );

        const installations = response.data;
        console.log("✅ Retrieved GitHub installations:", installations);

        if (!Array.isArray(installations) || installations.length === 0) {
            console.warn("⚠️ No GitHub installations found for this user.");
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ installations: [], accessTokens: {} }),
            };
        }

        const APP_ID = process.env.GITHUB_APP_ID;
        const PRIVATE_KEY = Buffer.from(process.env.GITHUB_PRIVATE_KEY, "base64").toString("utf-8");

        const now = Math.floor(Date.now() / 1000);
        const jwtToken = jwt.sign(
            { iat: now, exp: now + 600, iss: APP_ID },
            PRIVATE_KEY,
            { algorithm: "RS256" }
        );

        console.log("🔑 Generated JWT for GitHub API Authentication");

        let accessTokens = {};

        for (const installationId of installations) {
            try {
                const tokenResponse = await axios.post(
                    `https://api.github.com/app/installations/${installationId}/access_tokens`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                            Accept: "application/vnd.github+json",
                        },
                    }
                );

                accessTokens[installationId] = tokenResponse.data.token;
                console.log(`✅ Retrieved Access Token for Installation ${installationId}`);
            } catch (error) {
                console.error(`❌ Failed to get token for Installation ${installationId}:`, error.response?.data || error.message);
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ installations, accessTokens }),
        };
    } catch (error) {
        console.error("❌ API Fetch Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

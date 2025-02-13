const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.handler = async function (event) {
    // Handle CORS Preflight Requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // ✅ Allow requests from any domain (Update to a specific domain if needed)
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, sessionid",
                "Access-Control-Allow-Credentials": "true",
            },
            body: "",
        };
    }

    try {
        const sessionID = event.headers["sessionid"]; // ✅ Extract session ID from headers

        if (!sessionID) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Session ID missing." }),
            };
        }

        // Fetch the user's GitHub installation ID using API key authentication
        const installationRes = await axios.get(
            `${process.env.API_BASE_URL}/rest-api/users/installations/${sessionID}`,
            {
                headers: { "x-api-key": process.env.API_KEY },
            }
        );

        if (!installationRes.data || !installationRes.data.installation_id) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Installation ID not found." }),
            };
        }

        const installationID = installationRes.data.installation_id;

        // Generate GitHub App JWT
        const APP_ID = process.env.GITHUB_APP_ID;
        const PRIVATE_KEY = Buffer.from(process.env.GITHUB_PRIVATE_KEY, "base64").toString("utf-8");

        const now = Math.floor(Date.now() / 1000);
        const jwtToken = jwt.sign(
            { iat: now, exp: now + 600, iss: APP_ID },
            PRIVATE_KEY,
            { algorithm: "RS256" }
        );

        // Get Installation Access Token from GitHub
        const tokenResponse = await axios.post(
            `https://api.github.com/app/installations/${installationID}/access_tokens`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );

        const githubAccessToken = tokenResponse.data.token;

        // Return success response with CORS headers and the token set as a secure cookie
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
                "Set-Cookie": `githubAccessToken=${githubAccessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ success: true, githubAccessToken }),
        };

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

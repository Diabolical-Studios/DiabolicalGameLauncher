const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.handler = async function (event) {
    try {
        const sessionID = event.headers["sessionid"]; // ✅ Get session ID from headers

        if (!sessionID) {
            return { statusCode: 401, body: JSON.stringify({ error: "Session ID missing." }) };
        }

        // Fetch the user's installation ID from our API with API key authentication
        const installationRes = await axios.get(
            `${process.env.API_BASE_URL}/rest-api/users/installations/${sessionID}`,
            {
                headers: { "x-api-key": process.env.API_KEY } // ✅ Add API key in headers
            }
        );

        if (!installationRes.data || !installationRes.data.installation_id) {
            return { statusCode: 404, body: JSON.stringify({ error: "Installation ID not found." }) };
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

        // Return success response with the token set as a secure cookie
        return {
            statusCode: 200,
            headers: {
                "Set-Cookie": `githubAccessToken=${githubAccessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ success: true, githubAccessToken }),
        };

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

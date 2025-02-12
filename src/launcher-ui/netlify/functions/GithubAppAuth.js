const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.handler = async function (event) {
    const {installation_id, setup_action} = event.queryStringParameters;

    console.log("📥 GitHub Callback Received:", {installation_id, setup_action});

    if (!installation_id) {
        console.error("❌ Missing installation_id in GitHub redirect");
        return {
            statusCode: 400, body: JSON.stringify({error: 'Missing "installation_id" parameter'}),
        };
    }

    try {
        const APP_ID = process.env.GITHUB_APP_ID;
        const PRIVATE_KEY = Buffer.from(process.env.GITHUB_PRIVATE_KEY, "base64").toString("utf-8");

        const now = Math.floor(Date.now() / 1000);
        const jwtToken = jwt.sign({
            iat: now, exp: now + 600,
            iss: APP_ID,
        }, PRIVATE_KEY, {algorithm: "RS256"});

        console.log("🔑 Generated JWT for GitHub API Authentication");

        const tokenResponse = await axios.post(`https://api.github.com/app/installations/${installation_id}/access_tokens`, {}, {
            headers: {
                Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json",
            },
        });

        const installationAccessToken = tokenResponse.data.token;
        console.log("✅ Successfully retrieved Installation Access Token");

        return {
            statusCode: 302, headers: {
                Location: `diabolicallauncher://github-app?githubInstallationId=${installation_id}&githubAccessToken=${installationAccessToken}`
            },
        };

    } catch (error) {
        console.error("❌ Error retrieving GitHub Installation Access Token:", error.response?.data || error.message);
        return {
            statusCode: 500, body: JSON.stringify({error: error.response?.data || error.message}),
        };
    }
};


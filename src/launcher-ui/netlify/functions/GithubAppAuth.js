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
        // Generate JWT for GitHub App authentication
        const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
        const PRIVATE_KEY_BASE64 = process.env.GITHUB_PRIVATE_KEY;
        const PRIVATE_KEY = Buffer.from(PRIVATE_KEY_BASE64, "base64").toString("utf8");

        const payload = {
            iat: Math.floor(Date.now() / 1000) - 60, // Issued 1 min in past to prevent clock skew
            exp: Math.floor(Date.now() / 1000) + 600, // Expire in 10 minutes
            iss: GITHUB_APP_ID,
        };

        const jwtToken = jwt.sign(payload, PRIVATE_KEY, {algorithm: "RS256"});

        console.log("🔑 Generated JWT for GitHub API Authentication");

        // Exchange JWT for an Installation Access Token
        const tokenResponse = await axios.post(`https://api.github.com/app/installations/${installation_id}/access_tokens`, {}, {
            headers: {
                Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json",
            },
        });

        const accessToken = tokenResponse.data.token;
        console.log("✅ Successfully retrieved Installation Access Token");

        return {
            statusCode: 200, headers: {"Content-Type": "text/html"}, body: `
                <html>
                <script>
                    console.log("📥 Sending postMessage to opener:", "${installation_id}");

                    if (window.opener) {
                        window.opener.postMessage(
                            { 
                                githubInstallationId: "${installation_id}",
                                githubAccessToken: "${accessToken}"
                            }, 
                            "*"
                        );
                        console.log("✅ postMessage sent:", "${installation_id}");
                    } else {
                        console.error("❌ window.opener is NULL. Cannot send postMessage.");
                    }

                    // Close the popup after sending the message
                    setTimeout(() => {
                        console.log("🚪 Closing popup after postMessage...");
                        window.close();
                    }, 1000);
                </script>
                <body>
                    <p>GitHub App Auth Successful! Redirecting...</p>
                </body>
                </html>
            `,
        };
    } catch (error) {
        console.error("❌ Error fetching Installation Access Token:", error);
        return {
            statusCode: 500, body: JSON.stringify({error: error.response?.data || error.message}),
        };
    }
};

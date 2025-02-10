const axios = require("axios");
const jwt = require("jsonwebtoken");
const fs = require("fs");

exports.handler = async function (event) {
    const { installation_id, setup_action } = event.queryStringParameters;

    console.log("📥 GitHub Callback Received:", { installation_id, setup_action });

    if (!installation_id) {
        console.error("❌ Missing installation_id in GitHub redirect");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing "installation_id" parameter' }),
        };
    }

    try {
        // ✅ 1️⃣ Generate JWT for authentication
        const APP_ID = process.env.GITHUB_APP_ID;
        const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

        const now = Math.floor(Date.now() / 1000);
        const jwtToken = jwt.sign(
            {
                iat: now,
                exp: now + 600, // Valid for 10 minutes
                iss: APP_ID,
            },
            PRIVATE_KEY,
            { algorithm: "RS256" }
        );

        console.log("🔑 Generated JWT for GitHub API Authentication");

        // ✅ 2️⃣ Exchange JWT for an installation access token
        const tokenResponse = await axios.post(
            `https://api.github.com/app/installations/${installation_id}/access_tokens`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );

        const installationAccessToken = tokenResponse.data.token;
        console.log("✅ Successfully retrieved Installation Access Token");

        // ✅ 3️⃣ Send token back to the client via postMessage
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `
                <html>
                <script>
                    console.log("📥 Sending postMessage to opener with Installation Token");

                    if (window.opener) {
                        window.opener.postMessage(
                            { 
                                githubInstallationId: "${installation_id}",
                                githubAccessToken: "${installationAccessToken}" 
                            }, 
                            "*"
                        );
                        console.log("✅ postMessage sent successfully.");
                    } else {
                        console.error("❌ window.opener is NULL. Cannot send postMessage.");
                    }

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
        console.error("❌ Error retrieving GitHub Installation Access Token:", error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

const axios = require("axios")
const jwt = require("jsonwebtoken")

exports.handler = async function (event) {
    const { GITHUB_APP_ID, GITHUB_PRIVATE_KEY, API_BASE_URL, API_KEY } = process.env
    const { installation_id, setup_action, github_id } = event.queryStringParameters || {}

    console.log("📥 GitHub Callback Received:", { installation_id, setup_action, github_id })

    if (!installation_id || !github_id) {
        console.error("❌ Missing required parameters in GitHub redirect")
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing "installation_id" or "github_id" parameter' }),
        }
    }

    try {
        const now = Math.floor(Date.now() / 1000)
        const privateKey = Buffer.from(GITHUB_PRIVATE_KEY, "base64").toString("utf-8")
        const jwtToken = jwt.sign(
            { iat: now, exp: now + 600, iss: GITHUB_APP_ID },
            privateKey,
            { algorithm: "RS256" }
        )

        console.log("🔑 Generated JWT for GitHub API Authentication")

        const tokenResponse = await axios.post(
            `https://api.github.com/app/installations/${installation_id}/access_tokens`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    Accept: "application/vnd.github+json",
                },
            }
        )

        const installationAccessToken = tokenResponse.data.token
        console.log("✅ Successfully retrieved Installation Access Token")

        // Add the installation to the user's record
        await axios.post(
            `${API_BASE_URL}/rest-api/users/installations`,
            { github_id, installation_id },
            { headers: { "x-api-key": API_KEY } }
        )
        console.log("✅ Successfully linked installation_id to the user")

        return {
            statusCode: 302,
            headers: {
                Location: `diabolicallauncher://github-app?githubInstallationId=${installation_id}&githubAccessToken=${installationAccessToken}`,
            },
        }
    } catch (error) {
        console.error("❌ Error retrieving GitHub Installation Access Token:", error.response?.data || error.message)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        }
    }
}

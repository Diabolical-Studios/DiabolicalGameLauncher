const axios = require("axios");

exports.handler = async function (event) {
    // Handle CORS Preflight Requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            body: "",
        };
    }

    try {
        const sessionID = event.headers["sessionid"]; // ✅ Extract session ID from headers

        if (!sessionID) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Session ID missing." }),
            };
        }

        // Fetch the user's GitHub installations from the database
        const installationsRes = await axios.get(
            `${process.env.API_BASE_URL}/rest-api/users/installations/${sessionID}`,
            {
                headers: { "x-api-key": process.env.API_KEY },
            }
        );

        if (!installationsRes.data || !installationsRes.data.github_installations) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "No GitHub installations found." }),
            };
        }

        const githubInstallations = installationsRes.data.github_installations; // ✅ Extract multiple installations

        // Return success response with CORS headers and store installations in a secure cookie
        return {
            statusCode: 200,
            headers: {
                "Set-Cookie": `githubInstallations=${encodeURIComponent(JSON.stringify(githubInstallations))}; Path=/; HttpOnly; Secure; SameSite=Strict`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ success: true, githubInstallations }),
        };

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

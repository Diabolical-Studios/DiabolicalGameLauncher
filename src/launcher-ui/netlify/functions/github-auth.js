const axios = require("axios");
const {v4: uuidv4} = require("uuid");

exports.handler = async function (event) {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;

    const code = event.queryStringParameters.code;

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: 'Missing "code" parameter'}),
        };
    }

    try {
        // Exchange code for GitHub access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
            },
            {
                headers: {accept: "application/json"},
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Get user info from GitHub
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {Authorization: `token ${accessToken}`},
        });

        const {id: github_id, login: username, email = "N/A"} = userResponse.data;

        // Generate session ID
        const sessionID = uuidv4();

        // Log the payload to verify
        console.log("Payload:", {github_id, username, email, sessionID});

        // Create or update the user using the REST API
        await axios.post(
            `${API_BASE_URL}/rest-api/users`,
            {github_id, username, email, session_id: sessionID},
            {
                headers: {"x-api-key": API_KEY},
            }
        );

        // Return an HTML page that will set localStorage and close the popup
        return {
            statusCode: 200,
            headers: {"Content-Type": "text/html"},
            body: `
                <html>
                <script>
                    // Save session data
                    localStorage.setItem("sessionID", "${sessionID}");
                    localStorage.setItem("username", "${username}");

                    // Notify the parent window and close the popup
                    window.opener.postMessage({ username: "${username}", sessionID: "${sessionID}" }, "*");
                    window.close();
                </script>
                <body>
                    <p>Logging you in...</p>
                </body>
                </html>
            `,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({error: error.response?.data || error.message}),
        };
    }
};

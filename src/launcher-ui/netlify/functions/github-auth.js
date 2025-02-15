const axios = require("axios");
const {v4: uuidv4} = require("uuid");

exports.handler = async function (event) {
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;

    const code = event.queryStringParameters.code;
    // We’re re-using the `state` param from GitHub OAuth to store "electron" or "web"
    const source = event.queryStringParameters.state || "web";

    if (!code) {
        return {
            statusCode: 400, body: JSON.stringify({error: 'Missing "code" parameter'}),
        };
    }

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code: code,
        }, {
            headers: {accept: "application/json"},
        });

        const accessToken = tokenResponse.data.access_token;

        // Get user data from GitHub
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {Authorization: `token ${accessToken}`},
        });

        const {id: github_id, login: username, email = "N/A"} = userResponse.data;

        const sessionID = uuidv4();

        await axios.post(`${API_BASE_URL}/rest-api/users`, {github_id, username, email, session_id: sessionID}, {
            headers: {"x-api-key": API_KEY},
        });

        // Decide how to redirect based on source
        if (source === "electron") {
            // Electron route
            return {
                statusCode: 302, headers: {
                    Location: `diabolicallauncher://auth?sessionID=${sessionID}&username=${encodeURIComponent(username)}`,
                },
            };
        } else {
            // Web route
            return {
                statusCode: 302, headers: {
                    Location: `https://launcher.diabolical.studio/account/login?sessionID=${sessionID}&username=${encodeURIComponent(username)}`,
                },
            };
        }
    } catch (error) {
        return {
            statusCode: 500, body: JSON.stringify({error: error.response?.data || error.message}),
        };
    }
};
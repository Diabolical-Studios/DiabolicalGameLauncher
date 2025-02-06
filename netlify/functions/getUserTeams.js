const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;

    // Extract session ID from cookies
    const cookies = event.headers.cookie;
    if (!cookies) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized: No session found' }),
        };
    }

    const sessionID = cookies
        .split('; ')
        .find((row) => row.startsWith('sessionID='))
        ?.split('=')[1];

    if (!sessionID) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized: Invalid session' }),
        };
    }

    try {
        // Fetch the teams for the user using session_id
        const response = await axios.get(`${API_BASE_URL}/teams/session/${sessionID}`, {
            headers: { 'x-api-key': API_KEY },
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

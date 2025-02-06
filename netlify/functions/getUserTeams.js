const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");
    console.log("Received Headers:", event.headers);
    console.log("Cookies:", event.headers.cookie);

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405, body: JSON.stringify({error: "Method not allowed"}),
        };
    }

    const API_BASE_URL = process.env.API_BASE_URL;
    const API_KEY = process.env.API_KEY;

    const cookies = event.headers.cookie || "";
    const sessionID = cookies
        .split("; ")
        .find((row) => row.startsWith("sessionID="))
        ?.split("=")[1];

    if (!sessionID) {
        console.error("❌ No sessionID found in cookies.");
        return {
            statusCode: 401, body: JSON.stringify({error: "Unauthorized: No valid session ID"}),
        };
    }

    try {
        console.log("✅ Fetching teams from API...");
        const response = await axios.get(`${API_BASE_URL}/teams/session/${sessionID}`, {
            headers: {"x-api-key": API_KEY},
        });

        console.log("✅ API Response:", response.data);

        return {
            statusCode: 200, body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error("❌ API Fetch Error:", error.response?.data || error.message);
        return {
            statusCode: 500, body: JSON.stringify({error: error.response?.data || error.message}),
        };
    }
};

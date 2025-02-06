const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");
    console.log("Received Headers:", event.headers);

    // Read sessionID from headers instead of cookies
    const sessionID = event.headers.sessionid || event.headers["sessionid"] || event.headers["SessionID"];

    console.log("Extracted sessionID:", sessionID);

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: No valid session ID" }),
        };
    }

    try {
        console.log("✅ Fetching teams from API...");
        const response = await axios.get(`${process.env.API_BASE_URL}/teams/session/${sessionID}`, {
            headers: { "x-api-key": process.env.API_KEY },
        });

        console.log("✅ API Response:", response.data);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error("❌ API Fetch Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(event.headers, null, 2));

    // Ensure we get the correct header (case-insensitive)
    const headers = Object.keys(event.headers).reduce((acc, key) => {
        acc[key.toLowerCase()] = event.headers[key];
        return acc;
    }, {});

    const sessionID = headers["sessionid"];

    console.log("Extracted sessionID:", sessionID);

    // ✅ Handle CORS preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, sessionID",
            },
            body: "",
        };
    }

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return {
            statusCode: 401,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Unauthorized: No valid session ID" }),
        };
    }

    try {
        console.log("✅ Fetching teams from API...");
        const response = await axios.get(`${process.env.API_BASE_URL}/rest-api/teams/session/${sessionID}`, {
            headers: { "x-api-key": process.env.API_KEY },
        });

        console.log("✅ API Response:", response.data);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error("❌ API Fetch Error:", error.response?.data || error.message);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.response?.data || error.message }),
        };
    }
};

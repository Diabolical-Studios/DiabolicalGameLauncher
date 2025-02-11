const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");

    // Handle CORS preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        // Fetch games without any authentication
        const response = await axios.get(`${process.env.API_BASE_URL}/rest-api/games`);

        console.log("✅ API Response:", response.data);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        console.error("❌ API Fetch Error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "Internal Server Error" }),
        };
    }
};

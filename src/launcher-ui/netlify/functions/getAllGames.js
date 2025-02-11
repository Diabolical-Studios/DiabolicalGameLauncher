const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        const response = await axios.get(`${process.env.API_BASE_URL}/rest-api/games`);

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
        console.error("❌ API Fetch Error:", error);

        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message || "Internal Server Error" }),
        };
    }
};

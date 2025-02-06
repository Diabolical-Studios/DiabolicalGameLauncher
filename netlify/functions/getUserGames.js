const axios = require("axios");

exports.handler = async (event) => {
    console.log("=== Netlify Function Triggered ===");
    console.log("Received Headers:", JSON.stringify(event.headers, null, 2));
    console.log("Received Query Parameters:", event.queryStringParameters);

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    const teamName = event.queryStringParameters.team_name;
    const sessionID = event.headers.sessionid || event.headers["sessionid"];

    if (!teamName) {
        console.error("❌ Missing team name in request.");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing team name in request." }),
        };
    }

    if (!sessionID) {
        console.error("❌ No sessionID found in headers.");
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: No valid session ID" }),
        };
    }

    try {
        console.log(`✅ Fetching games for team: ${teamName}...`);
        const response = await axios.get(`${process.env.API_BASE_URL}/games/team/${encodeURIComponent(teamName)}`, {
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
            body: JSON.stringify({ error: error.response?.data || error

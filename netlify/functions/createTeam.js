const axios = require("axios");

exports.handler = async (event) => {
  console.log("=== Netlify Function Triggered ===");
  console.log("Received Headers:", JSON.stringify(event.headers, null, 2));

  // Normalize headers
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, sessionID",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method not allowed" }),
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

  let team_name;
  try {
    ({ team_name } = JSON.parse(event.body));
  } catch (error) {
    console.error("❌ Invalid JSON body:", error);
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!team_name) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing team_name" }),
    };
  }

  try {
    console.log("✅ Sending request to create team...");
    const response = await axios.post(
        `${process.env.API_BASE_URL}/teams`,
        { session_id: sessionID, team_name },
        {
          headers: { "x-api-key": process.env.API_KEY },
        }
    );

    console.log("✅ Team and membership created successfully:", response.data);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};

const axios = require("axios");

exports.handler = async (event) => {
  console.log("=== Netlify Function Triggered ===");
  console.log("Received Headers:", JSON.stringify(event.headers, null, 2));

  // Normalize headers (case-insensitive)
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
    console.log("✅ Fetching GitHub ID from session...");
    const githubIdResponse = await axios.get(
        `${process.env.API_BASE_URL}/users/session/${sessionID}`,
        {
          headers: { "x-api-key": process.env.API_KEY },
        }
    );

    const { github_id } = githubIdResponse.data;

    if (!github_id) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "GitHub ID not found for session" }),
      };
    }

    console.log("✅ Creating team...");
    const createTeamResponse = await axios.post(
        `${process.env.API_BASE_URL}/teams`,
        { team_name, github_id },
        {
          headers: { "x-api-key": process.env.API_KEY },
        }
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(createTeamResponse.data),
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

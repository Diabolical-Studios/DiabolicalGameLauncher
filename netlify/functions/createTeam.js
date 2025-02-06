const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { team_name } = JSON.parse(event.body);
  const API_BASE_URL = process.env.API_BASE_URL;
  const API_KEY = process.env.API_KEY;

  if (!team_name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing team_name' }),
    };
  }

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
    // Retrieve the github_id using sessionID
    const githubIdResponse = await axios.get(
      `${API_BASE_URL}/users/session/${sessionID}`,
      {
        headers: { 'x-api-key': API_KEY },
      }
    );

    const { github_id } = githubIdResponse.data;

    if (!github_id) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'GitHub ID not found for session' }),
      };
    }

    // Create the team using the retrieved github_id
    const createTeamResponse = await axios.post(
      `${API_BASE_URL}/teams`,
      { team_name, github_id: github_id },
      {
        headers: { 'x-api-key': API_KEY },
      }
    );

    return {
      statusCode: 201,
      body: JSON.stringify(createTeamResponse.data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};

const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { game_id, team_name, game_name, version, description, background_image_url, team_icon_url } = JSON.parse(event.body);
  const API_BASE_URL = process.env.API_BASE_URL;
  const API_KEY = process.env.API_KEY;

  if (!game_id || !team_name || !game_name || !version) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
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
    // Step 1: Retrieve the GitHub ID using sessionID
    const githubIdResponse = await axios.get(`${API_BASE_URL}/users/session/${sessionID}`, {
      headers: { 'x-api-key': API_KEY },
    });

    const sessionGithubId = githubIdResponse.data.github_id;

    if (!sessionGithubId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'GitHub ID not found for session' }),
      };
    }

    // Step 2: Retrieve the GitHub ID of the team owner
    const encodedTeamName = encodeURIComponent(team_name); // Properly encode the team name
    const teamResponse = await axios.get(`${API_BASE_URL}/teams/${encodedTeamName}`, {
      headers: { 'x-api-key': API_KEY },
    });

    const teamGithubId = teamResponse.data.github_id;

    if (!teamGithubId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'GitHub ID not found for the team' }),
      };
    }

    // Step 3: Check if the two GitHub IDs match
    if (sessionGithubId !== teamGithubId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Unauthorized: You do not own this team' }),
      };
    }

    // Step 4: Add the game to the backend API
    const gameUploadResponse = await axios.post(
      `${API_BASE_URL}/games`,
      { game_id, team_name, game_name, version, description, background_image_url, team_icon_url },
      {
        headers: { 'x-api-key': API_KEY },
      }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Game uploaded successfully', game: gameUploadResponse.data }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};

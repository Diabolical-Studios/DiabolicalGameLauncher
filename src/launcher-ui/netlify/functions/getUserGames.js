const axios = require('axios');

exports.handler = async event => {
  console.log('=== Netlify Function Triggered ===');

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const teamName = event.queryStringParameters.team_name;

  if (!teamName) {
    console.error('❌ Missing team_name in request.');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing team_name parameter' }),
    };
  }

  try {
    console.log(`🎯 Fetching games for team: ${teamName}`);

    const response = await axios.get(
      `${process.env.API_BASE_URL}/rest-api/games/team/${encodeURIComponent(teamName)}`,
      {
        headers: { 'x-api-key': process.env.API_KEY },
      }
    );

    console.log('✅ API Response:', response.data);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('❌ API Fetch Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};

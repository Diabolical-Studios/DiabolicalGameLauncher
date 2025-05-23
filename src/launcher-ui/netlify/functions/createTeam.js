const axios = require('axios');

exports.handler = async event => {
  console.log('=== Netlify Function Triggered ===');
  console.log('Received Headers:', JSON.stringify(event.headers, null, 2));

  const headers = Object.keys(event.headers).reduce((acc, key) => {
    acc[key.toLowerCase()] = event.headers[key];
    return acc;
  }, {});

  const sessionID = headers['sessionid'];

  console.log('Extracted sessionID:', sessionID);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!sessionID) {
    console.error('❌ No sessionID found in headers.');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: No valid session ID' }),
    };
  }

  let team_name;
  try {
    ({ team_name } = JSON.parse(event.body));
  } catch (error) {
    console.error('❌ Invalid JSON body:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!team_name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing team_name' }),
    };
  }

  let team_icon_url;
  try {
    ({ team_icon_url } = JSON.parse(event.body));
  } catch (error) {
    console.error('❌ Invalid JSON body:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!team_icon_url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing team_icon_url' }),
    };
  }

  try {
    console.log('✅ Sending request to create team...');
    const response = await axios.post(
      `${process.env.API_BASE_URL}/rest-api/teams`,
      { session_id: sessionID, team_name, team_icon_url },
      {
        headers: { 'x-api-key': process.env.API_KEY },
      }
    );

    console.log('✅ Team and membership created successfully:', response.data);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};

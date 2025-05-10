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

  if (!sessionID) {
    console.error('❌ No sessionID found in headers.');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: No valid session ID' }),
    };
  }

  try {
    console.log('✅ Fetching teams from API...');
    const response = await axios.get(
      `${process.env.API_BASE_URL}/rest-api/teams/session/${sessionID}`,
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
    console.error('❌ API Fetch Error:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};

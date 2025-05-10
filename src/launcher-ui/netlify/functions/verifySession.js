const axios = require('axios');

exports.handler = async event => {
  console.log('=== verifySession Netlify Function Triggered ===');
  console.log('Received Headers:', JSON.stringify(event.headers, null, 2));

  // Normalize headers to lowercase for easier access
  const headers = Object.keys(event.headers).reduce((acc, key) => {
    acc[key.toLowerCase()] = event.headers[key];
    return acc;
  }, {});

  const sessionID = headers['sessionid'];
  console.log('Extracted sessionID:', sessionID);

  // Handle preflight requests
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

  if (!sessionID) {
    console.error('❌ No sessionID found in headers.');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: No valid session ID' }),
    };
  }

  try {
    console.log('✅ Sending request to backend to verify session...');
    const response = await axios.get(
      `${process.env.API_BASE_URL}/rest-api/users/session/${sessionID}`,
      {
        headers: { 'x-api-key': process.env.API_KEY },
      }
    );

    console.log('✅ Backend response:', response.data);
    return {
      statusCode: 200,
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

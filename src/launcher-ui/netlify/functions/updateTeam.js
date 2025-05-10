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

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let teamData;
  try {
    teamData = JSON.parse(event.body);
  } catch (error) {
    console.error('❌ Invalid JSON body:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!teamData.team_id || !teamData.team_name || !teamData.team_icon_url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    console.log('✅ Sending request to update team...');
    const response = await axios.put(`${process.env.API_BASE_URL}/rest-api/teams`, teamData, {
      headers: { 'x-api-key': process.env.API_KEY },
    });

    console.log('✅ Team updated successfully:', response.data);

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

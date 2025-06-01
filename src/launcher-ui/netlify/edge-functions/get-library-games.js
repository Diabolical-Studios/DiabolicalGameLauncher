/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-undef */
export default async function (request, context) {
  console.log('=== Netlify Edge Function Triggered: Get Library Games ===');
  console.log('Received Headers:', JSON.stringify(Object.fromEntries(request.headers), null, 2));

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200 });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalize headers to lowercase for easier access
  const headersObj = {};
  for (const [key, value] of request.headers.entries()) {
    headersObj[key.toLowerCase()] = value;
  }

  // Try to get sessionID from headers or query string
  let sessionID = headersObj['sessionid'];
  if (!sessionID) {
    const url = new URL(request.url);
    sessionID = url.searchParams.get('sessionID') || url.searchParams.get('sessionid');
  }
  console.log('Extracted sessionID:', sessionID);

  if (!sessionID) {
    console.error('❌ No sessionID found in headers or query.');
    return new Response(JSON.stringify({ error: 'Unauthorized: No valid session ID' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    // Access environment variables using Netlify.env.get() for Deno
    const apiBaseUrl = Netlify.env.get('API_BASE_URL');
    const apiKey = Netlify.env.get('API_KEY');

    if (!apiBaseUrl || !apiKey) {
      console.error('❌ API configuration missing.');
      return new Response(JSON.stringify({ error: 'API configuration missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to the Buildsmith API
    const response = await fetch(`${apiBaseUrl}/rest-api/library/${sessionID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    console.log('✅ Library games retrieved successfully:', data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

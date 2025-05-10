export default async (request, context) => {
  console.log('=== Netlify Edge Function Triggered: Delete Game ===');
  console.log('Received Headers:', JSON.stringify(Object.fromEntries(request.headers), null, 2));

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200 });
  }

  // Only allow DELETE requests
  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { gameId, sessionId } = await request.json();

    if (!gameId || !sessionId) {
      return new Response('Missing required parameters', { status: 400 });
    }

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

    // Forward the request to the Diabolical API
    const response = await fetch(`${apiBaseUrl}/rest-api/games/${gameId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the Diabolical API
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in deleteGame edge function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

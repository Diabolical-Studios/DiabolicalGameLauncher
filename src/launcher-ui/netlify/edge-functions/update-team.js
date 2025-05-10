export default async (request, context) => {
  console.log('=== Netlify Edge Function Triggered ===');
  console.log('Received Headers:', JSON.stringify(Object.fromEntries(request.headers), null, 2));

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200 });
  }

  if (request.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let teamData;
  try {
    teamData = await request.json();
  } catch (error) {
    console.error('❌ Invalid JSON body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!teamData.session_id || !teamData.team_id || !teamData.team_name || !teamData.team_icon_url) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('✅ Sending request to update team...');

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

    const apiRes = await fetch(`${apiBaseUrl}/rest-api/teams`, {
      method: 'PUT',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('❌ API Error:', errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: apiRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseData = await apiRes.json();
    console.log('✅ Team updated successfully:', responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

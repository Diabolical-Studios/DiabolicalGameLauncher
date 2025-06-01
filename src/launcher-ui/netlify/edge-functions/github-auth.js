/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-undef */

export default async (request, context) => {
  console.log('=== Netlify Edge Function Triggered ===');

  // Parse query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // Accept provider from query, default to 'github'
  const provider = searchParams.get('provider') || 'github';
  const source = searchParams.get('state') || 'web';

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing "code" parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Access environment variables via Netlify.env.get() for Deno
  const CLIENT_ID = Netlify.env.get('GITHUB_CLIENT_ID');
  const CLIENT_SECRET = Netlify.env.get('GITHUB_CLIENT_SECRET');
  const API_BASE_URL = Netlify.env.get('API_BASE_URL');
  const API_KEY = Netlify.env.get('API_KEY');

  try {
    // Exchange the code for an access token using fetch
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: tokenRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Get user data from GitHub using the access token
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: userRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData = await userRes.json();
    const github_id = userData.id;
    const username = userData.login;
    const email = userData.email || 'N/A';

    // Generate a session ID using the Web Crypto API
    const sessionID = crypto.randomUUID();

    // Create the user record via your API
    const createUserRes = await fetch(`${API_BASE_URL}/rest-api/users`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ github_id, username, email, session_id: sessionID }),
    });

    if (!createUserRes.ok) {
      const errorText = await createUserRes.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: createUserRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine the redirect URL based on the source (electron or web)
    const providerParam = `provider=${provider}`;
    const sessionParams = `sessionID=${encodeURIComponent(sessionID)}&username=${encodeURIComponent(username)}&githubID=${encodeURIComponent(github_id)}`;
    const query = `${providerParam}&${sessionParams}`;
    const redirectUrl =
      source === 'electron'
        ? `buildsmith://auth?${query}`
        : `https://buildsmith.app/account?${query}`;

    return new Response('', {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

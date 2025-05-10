import { importPKCS8, SignJWT } from 'https://deno.land/x/jose@v4.14.4/index.ts';

export default async (request, context) => {
  // Parse query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const installation_id = searchParams.get('installation_id');
  const setup_action = searchParams.get('setup_action'); // Optional if needed

  console.log('📥 GitHub Callback Received:', { installation_id, setup_action });

  if (!installation_id) {
    console.error('❌ Missing installation_id in GitHub redirect');
    return new Response(JSON.stringify({ error: 'Missing "installation_id" parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Access environment variables using Netlify.env.get() for Deno
    const APP_ID = Netlify.env.get('GITHUB_APP_ID');

    // Decode the base64 encoded private key from the environment variable
    const PRIVATE_KEY = Netlify.env.get('GITHUB_PRIVATE_KEY');

    // Ensure PRIVATE_KEY is properly base64 decoded (PKCS#8)
    const privateKeyBuffer = new TextEncoder().encode(atob(PRIVATE_KEY));

    const now = Math.floor(Date.now() / 1000);

    // Import the private key as a CryptoKey using jose's helper
    const privateKey = await importPKCS8(privateKeyBuffer, 'RS256');

    // Generate JWT with RS256, valid for 10 minutes
    const jwtToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 600)
      .setIssuer(APP_ID)
      .sign(privateKey);

    console.log('🔑 Generated JWT for GitHub API Authentication');

    // Exchange the JWT for an installation access token via GitHub API
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installation_id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(errText);
    }

    const tokenData = await tokenRes.json();
    const installationAccessToken = tokenData.token;
    console.log('✅ Successfully retrieved Installation Access Token');

    // Decide the redirect URL (here, always the electron scheme)
    const redirectUrl = `diabolicallauncher://github-app?githubInstallationId=${installation_id}&githubAccessToken=${installationAccessToken}`;

    return new Response('', {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (error) {
    console.error('❌ Error retrieving GitHub Installation Access Token:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

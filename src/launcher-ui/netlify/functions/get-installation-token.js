const { importPKCS8, SignJWT } = require('jose');

exports.handler = async function (event, context) {
  // Handle CORS Preflight Requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      body: '',
    };
  }

  // Verify session ID
  const sessionID = event.headers['sessionid'];
  if (!sessionID) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Session ID missing.' }),
    };
  }

  try {
    // Parse request body
    const { installationId } = JSON.parse(event.body);
    if (!installationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Installation ID missing.' }),
      };
    }

    // Get app credentials from environment
    const APP_ID = process.env.GITHUB_APP_ID;
    const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;

    // Decode the base64 encoded private key
    const privateKeyBuffer = Buffer.from(PRIVATE_KEY, 'base64');

    const now = Math.floor(Date.now() / 1000);

    // Import the private key and generate JWT
    const privateKey = await importPKCS8(privateKeyBuffer.toString(), 'RS256');
    const jwtToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 600)
      .setIssuer(APP_ID)
      .sign(privateKey);

    // Exchange JWT for an installation access token
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
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

    return {
      statusCode: 200,
      body: JSON.stringify({ token: tokenData.token }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error getting installation token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

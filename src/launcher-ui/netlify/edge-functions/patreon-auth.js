// netlify/edge-functions/patreon-auth.js
export default async (event) => {
  const code = event.queryStringParameters?.code;
  const source = event.queryStringParameters?.state || "web";

  if (!code) {
    return { statusCode: 400, body: 'Missing code' };
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.PATREON_CLIENT_ID,
      client_secret: process.env.PATREON_CLIENT_SECRET,
      redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreon-auth'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return { statusCode: 400, body: 'Token exchange failed' };
  }

  // Fetch user info
  const userRes = await fetch(
    'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers',
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const userData = await userRes.json();

  // Check if user is a patron
  const isPatron = userData.included?.some(
    (m) => m.type === 'member' && m.attributes.patron_status === 'active_patron'
  );

  // TODO: Store user info in your DB/session and grant perks

  // Determine the redirect URL based on the source (electron or web)
  const providerParam = 'provider=patreon';
  const patreonParam = `patreon=${isPatron ? "success" : "fail"}`;
  const query = `${providerParam}&${patreonParam}`;
  const redirectUrl =
    source === "electron"
      ? `diabolicallauncher://auth?${query}`
      : `https://launcher.diabolical.studio/account?${query}`;

  return {
    statusCode: 302,
    headers: { Location: redirectUrl },
    body: ''
  };
};
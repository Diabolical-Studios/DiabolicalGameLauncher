// netlify/edge-functions/patreon-auth.js
export default async (request, context) => {
  console.log("=== Patreon Auth Function Started ===");
  console.log("Request URL:", request.url);
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const source = searchParams.get('state') || "web";
  
  console.log("Code:", code);
  console.log("Source:", source);

  if (!code) {
    console.log("No code provided");
    return new Response('Missing code', { status: 400 });
  }

  try {
    // Exchange code for access token
    console.log("Exchanging code for token...");
    const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: Netlify.env.get('PATREON_CLIENT_ID'),
        client_secret: Netlify.env.get('PATREON_CLIENT_SECRET'),
        redirect_uri: 'https://launcher.diabolical.studio/.netlify/functions/patreon-auth'
      })
    });
    
    console.log("Token response status:", tokenRes.status);
    const tokenData = await tokenRes.json();
    console.log("Token data received:", !!tokenData.access_token);
    
    if (!tokenData.access_token) {
      console.log("Token exchange failed:", tokenData);
      return new Response('Token exchange failed', { status: 400 });
    }

    // Fetch user info
    console.log("Fetching user info...");
    const userRes = await fetch(
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_tiers',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const userData = await userRes.json();
    console.log("User data received");

    // Check if user is a patron
    const isPatron = userData.included?.some(
      (m) => m.type === 'member' && m.attributes.patron_status === 'active_patron'
    );
    console.log("Is patron:", isPatron);

    // Determine the redirect URL based on the source (electron or web)
    const providerParam = 'provider=patreon';
    const patreonParam = `patreon=${isPatron ? "success" : "fail"}`;
    const query = `${providerParam}&${patreonParam}&code=${code}`;
    const redirectUrl =
      source === "electron"
        ? `diabolicallauncher://auth?${query}`
        : `https://launcher.diabolical.studio/account?${query}`;
    
    console.log("Redirecting to:", redirectUrl);

    return new Response('', {
      status: 302,
      headers: { 
        Location: redirectUrl,
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error("Error in Patreon auth:", error);
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};